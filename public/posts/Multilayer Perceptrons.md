---
layout: distill
title: Multilayer Perceptrons and Backpropagation
description: A brief introduction to the theory behind deep learning, linear classifiers, gradient descent and backpropagation explained by going through the necessary information to understand multilayer perceptrons. 
tags: 
giscus_comments: true
date: 2024-02-20 12.00
featured: false
published: true

authors:
  - name: Otto Vintola
    url: "ottovintola.github.io"
    affiliations:
      name: Aalto University


bibliography: 2024-02-20-MLP.bib

# Optionally, you can add a table of contents to your post.
# NOTES:
#   - make sure that TOC names match the actual section names
#     for hyperlinks within the post to work correctly.
#   - we may want to automate TOC generation in the future using
#     jekyll-toc plugin (https://github.com/toshimaru/jekyll-toc).
toc:
  - name: Introduction
    # if a section has subsections, you can add them as follows:
    # subsections:
    #   - name: Example Child Subsection 1
    #   - name: Example Child Subsection 2
  - name: What is deep learning?
  - name: Linear Classifiers
  - name: Gradient Descent
  - name: Multilayer Perceptrons
  - name: Backpropagation
  - name: Conclusion

# Below is an example of injecting additional post-specific styles.
# If you use this post as a template, delete this _styles block.
_styles: >
  .img {;
    margin-bottom: 12px;
    text-align: center;
  }

---

## Introduction

This article will cover the basics about multilayer perceptrons – and the relevant equations to illustrate the inner workings – and how they are trained on data. The goal of this article is not to be a rigorous research paper or a comprehensive guide to the topic, but rather to provide a brief overview of the topic while giving myself the opportunity to recap the important concepts.

This will serve as the first addition to the deep learning series, which means there is a small detour to take about deep learning. The basic idea of deep learning will be covered and then we will move on to the main topic of the article. At the end there will be references.

---

## What is deep learning?

In a traditional machine learning problem feature engineering would be required. Predicting from the data with human made features, basically the engineer is telling the computer what parts of the data it should use to complete the task. However, sometimes features are hard to specify – especially when dealing with problems that can have many possible options for features such as **image classification** or **natural language processing**. 

This is where deep learning comes in. ```Deep learning is a subset of machine learning where the labels are defined – or learned as we will later see – by the computer itself.``` **Deep learning** itself is a subset of **representation learning** <d-cite key="bengio2014representation"></d-cite> where we use machine learning to find the mapping from the input to the output and also discover the mapping itself. This means that there is no direct feature engineering required from the engineers, however, providing clean and purposeful data is still crucial – its not possible to just throw in information and expect the wanted results. 

Sometimes feature engineering is important, like when we want a specified result from a well structured data set, however, 
deep learning is a powerful tool when dealing with unstructured data. Lets imagine that someone asked you to define the features of an image classification task, what would you say? Maybe its some prominent shape or color. While these may seem natural to a human, they are hard to define to a computer. 

Deep learning has been around for a long time now – the first neural network was created in 1958 <d-cite key="Rosenblatt1958ThePA"></d-cite> – but it has only recently become popular due to the increase in computational power and the increase in the amount of data available. 

---

## Linear Classifier

Before we defining multilayer perceptrons we need to understand the linear classifier. Lets say that we had a binary classification problem: our data is $$ (x^1, y^1) ... (x^n, y^n) $$ where $$ x^i $$ is the input and $$ y^i $$ is the output where $$ x \in R$$ and $$ y \in \{0, 1\} $$. Then with the data the aim is to find a function:

$$  f(x) = \sigma\left( \sum_{i=1}^{n} w_i x_i + b \right) = \sigma\left(\mathbf{w}^T\mathbf{x} + \mathbf{b}\right)
 $$ 

where $$ \sigma $$ is the sigmoid function and $$ w_i $$ and $$ b $$ are the weights and bias of the function. The sigmoid function is defined as $$ \sigma(x) = \frac{1}{1 + e^{-x}} $$.

Now with the logistic regression model the output is between 0 and 1, and can be interpreted as the probability that $$ x $$ belongs to one of the classes $$ p(y = 1 \mid x) = f(x) $$

At this point, training the classifier would mean finding some $$ \textbf{w} $$ and $$ \textbf{b} $$ that would classify most of our examples as correct. This means finding the likelihood function

$$ p(data | \textbf{w}, \textbf{b}) = \prod_{i=1}^{n} p(y^i | x^i, \textbf{w}, \textbf{b}) $$

that would maximize the probability of the data given the parameters. This is done by maximizing the log likelihood function (or more commonly minimze the negative of it)

$$ L(\textbf{w}, \textbf{b}) = - \sum_{i=1}^{n} y^i \log(f(x^i)) + (1 - y^i) \log(1 - f(x^i)) $$

This loss function specifically is called the cross-entropy loss function and the training of the model is done by minimizing it.

---

## Gradient Descent

For now a quick explanation of the minimization process – this will serve as the lead to backpropagation. Most of the training (finding optimal parameters) is done by using the gradient descent algorithm. Which a is a first order optimization algorithm that is used to find the minimum of a function. The algorithm works by taking the derivative of the function at a point and then moving in the opposite direction of the derivative. This is done iteratively until the algorithm converges to a minimum.

An image highlights the process quite nicely. The arrows represent the direction of the gradient and the red dot is the minimum of the function. The representation is a contour plot where the lines are orthogonal to the largest gradient. In reality the function is multidimensional and the gradient is a vector, but the idea is the same.
<figure style="text-align: center;">
    <img src="/assets/img/MLP/GD.png" alt="Gradient Descent" style="width: 50%; height: auto; display: block; margin: 0 auto;">
    <figcaption style="font-style: italic;">Gradient Descent from Wikipedia</figcaption>
</figure>

The equation representing the iterative process of updating model parameters is 

$$ \theta_{t+1} = \theta_t - \alpha g(\theta_t) $$

where $$ \theta $$ is the parameter, $$ \alpha $$ is the learning rate and $$ g(\theta) $$ is the gradient of the function at the point $$ \theta $$. Now, with backpropagation we can **efficiently** calculate the gradient of the loss function with respect to the parameters of the model and then use gradient descent to update the parameters. 

--- 


## Multilayer Perceptrons

Now, with this information we can define what is a multilayer perceptron (MLP) <d-cite key="Rosenblatt1958ThePA"></d-cite>. They are basically regarded as the general case for a neural network where each neuron implements a function 

$$ 

f(x) = \phi\left( \sum_{i=1}^{n} w_i x_i + b \right) = \phi\left(\mathbf{w}^T\mathbf{x} + \mathbf{b}\right)

$$ 

Where $$ \phi $$ implements a nonlinear activation function. 

The idea of the multilayer perceptron is to stack multiple layers of neurons on top of each other. The first layer is the input layer, the last layer is the output layer and the layers in between are called hidden layers. The hidden layers are the ones that make the network deep.

<figure style="text-align: center;">
    <img src="/assets/img/MLP/MLP.jpg" alt="Fully Connected MLP" style="width: 50%; height: auto; display: block; margin: 0 auto;">
    <figcaption style="font-style: italic;">MLP</figcaption>
</figure>

Typically, mathematically we represent the network in a more compact style where each node compresses an entire layer. 

$$ 

h_1 = \phi\left(\mathbf{W}_1^T\mathbf{x} + \mathbf{b}_1\right) \rightarrow

h_2 = \phi\left(\mathbf{W}_2^T\mathbf{h}_1 + \mathbf{b}_2\right) \rightarrow

y = \phi\left(\mathbf{W}_3^T\mathbf{h}_2 + \mathbf{b}_3\right)

$$ 

We can think of the neural network as receiving the input $$ x $$ and then applying a function $$ f(x, \theta) $$ where $$ \theta $$ are the parameters of the model. Our neural network would be $$ f_3(f_2(f_1(x, \theta_1), \theta_2), \theta_3) $$ where $$ f_1, f_2, f_3 $$ are the functions of the layers and $$ \theta_1, \theta_2, \theta_3 $$ are the parameters of the layers.

Now, if the multilayer perceptron is solving a classification problem, the loss function 

$$ 
L(\theta) = - \sum_{i=1}^{n} y^i \log(f(x^i, \theta)) + (1 - y^i) \log(1 - f(x^i, \theta))
$$ 

is used to train the model – note $$ \theta $$ contains the model parameters $$ (\textbf{W}, \textbf{b}) $$. The training is done by using the gradient descent algorithm to minimize the loss function.


--- 

## Backpropagation

With massive neural networks calculating gradients becomes computationally expensive and slow. This is where backpropagation comes in. It is a method used to calculate the gradient of the loss function with respect to the parameters and the predicted label. The method is based on the chain rule of calculus and is used to calculate the gradient of the loss function with respect to the parameters of the model.

We apply the chain rule to the loss function with respect to each of the parameters

$$ 
\frac{\partial L}{\partial \theta} = \sum\frac{\partial L}{\partial y} \frac{\partial y}{\partial \theta} 
$$

$$
\frac{\partial L}{\partial h} = \sum\frac{\partial L}{\partial y} \frac{\partial y}{\partial h}
$$

$$
\frac{\partial L}{\partial w} = \sum\frac{\partial L}{\partial h} \frac{\partial h}{\partial w}
$$


where $$ \theta $$ are the parameters of the model and $$ f $$ is the output of the model. The first term is the gradient of the loss function with respect to the output of the model and the second term is the gradient of the output of the model with respect to the parameters of the model. The partial derivatives have to be summed to calculate the effect of the entire layer. 

```From here we can notice that backpropagation relies on the idea that, each connection in the network is affected by the previous layers value propagating to the output layer where the loss was calculated.``` Recursively calculating derivatives of the loss function with respect to the parameters of the model and the output of the model is the main idea of backpropagation. **Storing the intermediate steps of the calculation is crucial for the efficiency**.

---

## Conclusion

Deep learning has been around for a long time, but it has only recently become popular due to the increase in computational power and the increase in the amount of data available. Deep learning is a subset of machine learning where the labels are defined by the computer itself.

In this article we covered the basics about multilayer perceptrons – and the relevant equations – to hopefully shed some light into this bundle of complexity. I got to recap many important topics and ideas as well. 

I want to take the time to finally thank you (the reader) for reading this article. I hope you found it interesting and that you learned something new. If you have any questions or comments, feel free to email me at ```otto.vintola@aalto.fi```. 