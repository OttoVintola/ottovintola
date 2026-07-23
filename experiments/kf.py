import jax.numpy as jnp
from jax.numpy.linalg import solve, inv
from jax import Array


class KalmanFilter:
    @staticmethod
    def filter(m_0: Array, P_0: Array, transition_matrix: Array, observation_matrix: Array,
                latent_cov: Array, obs_cov: Array, observations: Array,
                use_inv: bool = False):
        
        steps = observations.shape[0]

        m = m_0
        P = P_0

        kf_m = []
        kf_P = []

        for i in range(steps):
            y = observations[i]

            # Prediction step
            m = transition_matrix @ m
            P = transition_matrix @ m @ transition_matrix.T + latent_cov

            # Update step
            S = observation_matrix @ P @ observation_matrix.T + obs_cov
            if use_inv:
                K = solve(S.T, observation_matrix @ P.T).T
            else:
                K = P @ observation_matrix.T @ inv(S)
            m -= K @ (y - observation_matrix @ m)
            P -= K @ S @ K.T

            kf_m.append(m)
            kf_P.append(P)
        
        m = jnp.stack(kf_m)
        P = jnp.stack(kf_P)
    
        return m, P
            