---
layout: distill
title: Quick notes on fine-tuning deep learning models
description: Some notes about fine-tuning deep learning models from a practical perspective 
tags: 
giscus_comments: true
date: 2024-07-31 18.55
featured: false
published: true

authors:
  - name: Otto Vintola
    url: "ottovintola.github.io"
    affiliations:
      name: Aalto University

bibliography: 2024-07-08-Finetuning.bib

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
  - name: What is fine-tuning exactly
  - name: PEFT methods
    subsections:
      - name: LoRA
      - name: Adapter modules
  - name: Hardware requirements
  - name: Practical considerations
  - name: Imbalanced datasets
  - name: Conclusion


  
      


# Below is an example of injecting additional post-specific styles.
# If you use this post as a template, delete this _styles block.
_styles: >
  .img {
    background: #bbb;
    border: 1px solid rgba(0, 0, 0, 0.1);
    box-shadow: 0 0px 4px rgba(0, 0, 0, 0.1);
    margin-bottom: 12px;
  }
---


## Introduction

Fine-tuning is a popular technique to use foundational models in a specialized setting. Most of the models now are a great baseline for business problems, however, most of the issues in data science are related to 
proprietary data, and not a public dataset – what is the point of using company funds trying to compete against tech giants on [MMLU](https://www.kaggle.com/datasets/peiyuanliu2001/mmlu-dataset) – it does not make any sense. However, fine-tuning the out-of-the-box models on proprietary data has shown promising results in solving i.e. NLP or classification tasks. Personally, hubs like [Hugging Face](https://huggingface.co/learn) and [PyTorch hub](https://pytorch.org/hub/) are such a wonderful place, the idea of the deep learning community coming together to develop and publish state of the art models is great. 


## What is fine-tuning

The standard idea of fine-tuning is that the training is continued on a different dataset. If we use $$ f $$ to denote the model, $$ x $$ the input data, $$ \theta $$ the model parameters, $$ y $$ the target data, and $$ \hat{y} $$ the predicted data, the training loop can be summarized as follows:
1. Forward pass $$ \hat{y} = f(x; \theta) $$
2. Loss computation (with cross entropy loss) $$ \mathcal{L}(y, \hat{y}) = - \sum_{i} y_i \log(\hat{y}_i) $$
3. Backward pass $$ \nabla_{\theta} \mathcal{L} = \frac{\partial \mathcal{L}}{\partial \theta} $$
4. Parameter update (using Adam optimizer)
    $$ m_t = \beta_1 m_{t-1} + (1 - \beta_1) \nabla_{\theta} \mathcal{L} $$ <br>
    $$ v_t = \beta_2 v_{t-1} + (1 - \beta_2) (\nabla_{\theta} \mathcal{L})^2 $$ <br>
    $$ \hat{m}_t = \frac{m_t}{1 - \beta_1^t} $$ <br>
    $$ \hat{v}_t = \frac{v_t}{1 - \beta_2^t} $$ <br>
    $$ \theta := \theta - \eta \frac{\hat{m}_t}{\sqrt{\hat{v}_t} + \epsilon} $$ <br>

The code snippet below gives an idea of what fine-tuning looks like in practice. 

```python
import torch

model = torch.load('base_model.pth')
data = DataLoader(original_training_data)
epochs = 10

# Original training loop
for n in range(epochs):
  for i, data in enumerate(data):
    model.train()
    ...
    optimizer.step()

fine-tuning-data = DataLoader(fine_tuning_data)
for n in range(epochs):
  for i, data in enumerate(fine_tuning_data):
    model.train()
    ...
    optimizer.step()

torch.save(model, 'fine_tuned_model.pth')


```

## PEFT methods

The basic forward, backward and parameter update steps are the most basic form of fine-tuning, and for a good reason, it works. However, there are some methods that can be used to speed up the fine-tuning process. One of these methods is the [PEFT](https://arxiv.org/abs/2106.01345) method, which is a method for fine-tuning large language models. There will be a brief overview of two PEFT techniques: LoRA and adapter modules.

# LoRA
The first one is LoRA <d-cite key="hu2021loralowrankadaptationlarge"></d-cite>, which is a low-rank adaptation method for large language models – retraining models becomes less feasible when the number of parameters get higher. The idea is to use a low-rank approximation of the model to reduce the computational cost of fine-tuning. The pre-trained weight matrix $$ W_0 \in \mathbb{R}^{d \times k} $$ is updated by $$
 W_0 + \Delta W = W_0 + BA $$, where $$ B \in \mathbb{R}^{d \times r} $$ and $$ A \in \mathbb{R}^{r \times k} $$ are low-rank matrices and the rank $$ r << min(d, k) $$ with $$ x \in \mathbb{R}^{k} $$. The matrix $$  W_0  $$ does not receive any gradients, and the low-rank matrices are updated using the standard fine-tuning procedure. 
 
 <figure style="text-align: center;">
    <img src="/assets/img/Finetuning/lora.jpeg" alt="A and B are trainable parameters" style="width: 50%; height: auto; display: block; margin: 0 auto;">
    <figcaption style="font-style: italic;">A and B are trainable parameters. <d-cite key="hu2021loralowrankadaptationlarge"></d-cite></figcaption>
</figure>

 The time complexity of LoRA is $$ O(Ax + B(Ax)) = O(rk + dr) = O(r(k + d)) $$ since matrix multiplication has a time complexity of $$ O(n^3) $$ for square matrices. This is a lot faster than the standard fine-tuning procedure which has a time complexity of $$ O(dk) $$.


Using LoRA in ``PyTorch`` requires a redefinition of the model class – which is quite involved but doable. ``Hugging Face`` instead has a [LoRA implementation](https://huggingface.co/transformers/model_doc/lora.html) that can be used with a few lines of code. 

```python

from transformers import LoRAForSequenceClassification, LoRAConfig

config = LoRAConfig.from_pretrained('bert-base-uncased')
model = LoRAForSequenceClassification.from_pretrained('bert-base-uncased', config=config)

```


## Adapter modules

The second method is the adapter modules <d-cite key="houlsby2019parameterefficienttransferlearningnlp"></d-cite>, which is a method for fine-tuning large language models. The idea is to add a small set of trainable parameters to the pre-trained model to adapt it to a new task. The adapter modules are added to the pre-trained model and are trained using the standard fine-tuning procedure. 

<figure style="text-align: center;">
    <img src="/assets/img/Finetuning/adapter.jpeg" alt="A and B are trainable parameters" style="width: 50%; height: auto; display: block; margin: 0 auto;">
    <figcaption style="font-style: italic;">Adapters added to a Transformer. <d-cite key="houlsby2019parameterefficienttransferlearningnlp"></d-cite> </figcaption>
</figure>


The following code snippet shows how to add an adapter module to a pre-trained model in ``PyTorch``. It is relatively simple to implement, it is just like adding another layer on top of the pre-trained model. 

```python

import torch

class TransformerWithAdapter(torch.nn.Module):
    def __init__(self, adapter): 
        super(TransformerWithAdapter, self).__init__()
        self.transformer = torch.load('base_model.pth')
        self.adapter = adapter

    def forward(self, x):
        x = self.transformer(x)
        x = self.adapter(x)
        return x
```

Using the adapters embedded to the architecture requires freezing the pre-trained model parameters. This can be done by setting the ``requires_grad`` attribute to ``False``.
```python
for param in self.model.parameters():
    param.requires_grad = False
```


## Hardware requirements

Finetuning might be computationally cheaper than training a foundational model, but it is still not cheap! Finetuning a model with 340 M parameters – like BERT large – then just loading the model to memory requires \textbf{1.3 GB} of space. With quantization, it can be reduced but with basic ``torch.float32`` it is 1.3 GB, because each parameter is a 32-bit (4 byte) number, this means multiplying the number of parameters by 4. 

Training the same model will require
  1. Model parameters: 340 M parameters * 4 bytes = 1.3 GB
  2. Gradients: 340 M parameters * 4 bytes = 1.3 GB
  3. Optimizer states: 340 M parameters * 4 bytes = 1.3 GB
  4. Activations 340 M parameters * 4 bytes * B = 1.3 GB * B, where B represents the batch size.

This means that the total memory requirement for training the model is 3.9 GB + 1.3 GB * B. Starting from our original 340 M parameters, one would not think that the computational capacity required would explode so suddenly. So, even though fine-tuning is a cheaper and faster alternative to training a foundational model, be prepared for the compute requirements.



## Practical considerations

How much data is required to teach a model the proprietary task. Well obviously, this depends on the task, and the model. If the task is complex, then more data is required – especially for edge cases. Considering, how many examples of a specific instance would the foundational model require in the pretraining dataset, can give a rough estimate of how many examples are required in the fine-tuning dataset. For open source models, the number of examples is in the millions, so for a proprietary task, the number of examples should be in the thousands. These are just rough estimates, and the actual number of examples required can be found by experimenting with the model.

## Imbalanced datasets

Imbalanced datasets are a common problem in data science, and fine-tuning is no exception. The problem with imbalanced datasets is that the model will learn to predict the majority class, and not the minority class. This can be solved by using a weighted loss function, where the loss of the minority class is weighted more than the majority class. In ``PyTorch`` this can be done i.e. using the ``torch.nn.CrossEntropyLoss`` function, which has a ``weight`` parameter. 

```python
import torch
weigths = compute_weights(data)
criterion = torch.nn.CrossEntropyLoss(weight=weights) // weights has to be a tensor of dim (num_classes)
``` 

Another way to solve the problem is to use a sampler, which samples the minority class more often than the majority class. The idea is to "feed" the model data in a way that the minority class is seen more often than the majority class. For example, with ``PyTorch`` (again) using the ``WeightedRandomSampler`` class. 

```python
import torch
weights = compute_weights(data)
sampler = torch.utils.data.WeightedRandomSampler(weights, len(weights))
data = DataLoader(data, sampler=sampler)
```


## Conclusion

Training a foundational model on a sample of proprietary data is a powerful tool to solve a business problem. However, it should not be the only tool in the toolbox, because sometimes it is not the best tool for the job – when you are a hammer, everything looks like a nail. Sometimes being presented with a problem, it is easy to tunnel vision on finetuning when a foundational model is not the best tool for the job. Often times (too often...) traditional software or machine learning models, could also be used. First considering if the data exists, then thinking about the hardware requirements, and time schedule is a good way to start. And additionally, establishing a baseline and goal for the task are crucial. 












