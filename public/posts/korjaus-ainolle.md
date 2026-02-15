---
title: Korjaus Ainolle
date: 2026-02-14 11:12
excerpt: Korjaus Ainolle
visible: false
---

Olkoon $n$ positiivinen kokonaisluku. Tarkastellaan funktiota
$$
f(x) = sin(\frac{x}{n}) \text{ ja } g(x) = ncos(x).
$$

Osoita, että yhtälön $f(x) = g(x)$ ratkaisulle $x_0 \in [0, \frac{\pi}{2}]$ pätee $g'(x_0) < -n + 1$. 

**Ratkaisu:**
$$
sin(\frac{x_0}{n}) = ncos(x_0) \iff cos(x_0) = \frac{sin(\frac{x_0}{n})}{n} \leq \ldots
$$

Näin ollen, tiedetään myös:
$$
sin(x_0) = \ldots \geq \sqrt{1 - \frac{1}{n^2}},
$$

joten
$$
-nsin(x_0) \leq -n\sqrt{1 - \frac{1}{n^2}}.
$$

Tällöin
$$
\ldots < \ldots \iff -n \sqrt{1 - \frac{1}{n^2}} > -n + 1 \iff g'(x_0) < -n + 1.
$$

