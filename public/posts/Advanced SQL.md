---
layout: post
title: Advanced SQL and Query Optimization
date: 2024-02-26 11:12
description: What I learned about SQL and making queries run faster and more sustainably than before
tags:
categories:
pretty_table: true
related_posts: true
---

## Introduction
Recently, I've been studying SQL for some data engineering tasks. I came across a course that mentioned about using Arrays – which I did not even know existed in SQL, additionally, there were ideas and best practices about how to make queries more efficient. I knew that most database systems have **query optimizers** that attempt to interpret/execute the query efficiently, but there were some strategies that could still make a massive impact on the performance of the query.

<br />
## Nested Data

Lets imagine a hypothetical dataset that has the information about people and their jobs. The data is stored in two tables called `Employees` and the columns are `ID`, `Name`, `Age`, and then there is another table called `Information` with columns `JobID`, `Job` and `Tasks`. The `JobID` is a foreign key that references the `ID` in the `people` table.

**Employees Table**

| ID           | Name           | Age           | 
| :----------- | :------------  | :------------ | 
| 101            | John           | 45            | 
| 42            | Jack           | 35            | 
| 89            | Jill           | 58            | 

<br>

**Information Table**

| JobID        | Job               | Tasks            |
| :----------- | :------------     | :------------     |
| 89            |      Software     |     Coding        |
| 42            |      Sales        |      Negotiating      |
| 101            |      Legal        |       Advise      |

<br>

We can either construct the tables like this, or we can use a nested column (a row inside of a row) to store the information. You can think of the row entry being used as a reference to more rows. The nested data structure would look like this:

**Employees_Information**

| ID           | Name           | Age           | Jobs                          |
| :----------- | :------------  | :------------ | :------------                 |
| 101           | John           | 45            | {Job: Legal, Tasks: Advise}      |
| 42            | Jack           | 35            | {Job: Sales, Tasks: Negotiating} |
| 89            | Jill           | 58            | {Job: Software, Tasks: Coding}   |

<br>
The nested data structure is more efficient because it reduces the number of joins that need to be performed. Additionally, it reduces the database schema complexity making it easier to understand and maintain. 

To extract the data from this nested structure, we can use a query like this:

```sql
SELECT ID, Name, Age
FROM Employees_Information,
    Jobs.Job AS Job, Jobs.Tasks AS Task
```

Which would result in a table like this:

| ID           | Name           | Age           | Job           | Task           |
| :----------- | :------------  | :------------ | :------------  | :------------  |
| 101           | John           | 45            | Legal         | Advise         |
| 42            | Jack           | 35            | Sales         | Negotiating    |
| 89            | Jill           | 58            | Software      | Coding         |





<br />
## Repeated Data

Another a more realistic scenario is when we can have multiple tasks per job. In this scenario we can use an `Array` to store the tasks. The `Employees` table would look like this:

**Employees_Information**

| ID           | Name           | Age           | Job           | Tasks           |
| :----------- | :------------  | :------------ | :------------  | :------------   |
| 101           | John           | 45            | Legal         | [Advise, Research] |
| 42            | Jack           | 35            | Sales         | [Negotiating, Marketing] |
| 89            | Jill           | 58            | Software      | [Coding, Testing] |

<br>
To extract the data from this array structure, we can use a query like this:

```sql
SELECT ID, Name, Age, Job, Task
FROM Employees_Information,
    UNNEST(Tasks) AS Task
```

From this query we would get a table like this:

| ID           | Name           | Age           | Job           | Task           |
| :----------- | :------------  | :------------ | :------------  | :------------  |
| 101           | John           | 45            | Legal         | Advise         |
| 101           | John           | 45            | Legal         | Research       |
| 42            | Jack           | 35            | Sales         | Negotiating    |
| 42            | Jack           | 35            | Sales         | Marketing      |
| 89            | Jill           | 58            | Software      | Coding         |
| 89            | Jill           | 58            | Software      | Testing        |

<br>
Note the difference thus between using a nested structure and arrays! 

It is also possible to have nested structures within arrays, and arrays within nested structures. This can be useful for storing complex data structures in a single column.  

<br />
## Query Optimization

The three main strategies for optimizing queries that I recently learned are
1. Only select columns needed/wanted
2. Read less data
3. Avoid N:N Joins
    
<br />
#### 1. Only select columns needed/wanted

Usually it is tempting to just get everything with `SELECT * FROM ...` but this is not efficient if all of the columns are not required for the query/results. 
To highlight the difference consider these two following queries ran on the [`bigquery-public-data.github_repos.contents`](https://cloud.google.com/bigquery/public-data) table:

```sql
SELECT * FROM `bigquery-public-data.github_repos.contents
```

```sql
SELECT size, binary FROM `bigquery-public-data.github_repos.contents
```

Data processed: 2682.118 GB <br>
Data processed: 2.531 GB

<br />
#### 2. Read less data

This point seems obvious, however, it might not be as straightforward as it seems. The idea is to be parsimonius about what columns to include in the query. Avoid as hard as you can to include columns that are not needed. Well, how can you do that? If there is a column with a 1-to-1 relationship with another column, then you can exclude one of them and use the other. For example, if you have a column `Country` and another column `CountryCode` you can exclude one of them and this will effectively reduce the amount of data read.

Consider the query below:

```sql
SELECT Country, Population, GDP, CountryCode
FROM CountryTable
WHERE CountryCode = 'US'
```

```sql
SELECT Country, Population, GDP
FROM CountryTable
WHERE Country = 'United States'
```

Since, the `CountryCode` and `Country` have a 1-to-1 correspondence, we can exclude one of them and use the other.

<br />
#### 3. Avoid N:N Joins

The idea here is to avoid joining tables that have a many-to-many relationship and instead separate the queries if possible, and then use an `INNER JOIN` to combine the results.

The query ran on the `bigquery-public-data.github_repos` below shows the difference

Slow
```sql
                 SELECT repo,
                     COUNT(DISTINCT c.committer.name) as num_committers,
                     COUNT(DISTINCT f.id) AS num_files
                 FROM `bigquery-public-data.github_repos.commits` AS c,
                     UNNEST(c.repo_name) AS repo
                 INNER JOIN `bigquery-public-data.github_repos.files` AS f
                     ON f.repo_name = repo
                 WHERE f.repo_name IN ( 'tensorflow/tensorflow', 'facebook/react', 'twbs/bootstrap', 'apple/swift', 'Microsoft/vscode', 'torvalds/linux')
                 GROUP BY repo
                 ORDER BY repo             
```

Fast

```sql
             WITH commits AS
                   (
                   SELECT COUNT(DISTINCT committer.name) AS num_committers, repo
                   FROM `bigquery-public-data.github_repos.commits`,
                       UNNEST(repo_name) as repo
                   WHERE repo IN ( 'tensorflow/tensorflow', 'facebook/react', 'twbs/bootstrap', 'apple/swift', 'Microsoft/vscode', 'torvalds/linux')
                   GROUP BY repo
                   ),
                   files AS 
                   (
                   SELECT COUNT(DISTINCT id) AS num_files, repo_name as repo
                   FROM `bigquery-public-data.github_repos.files`
                   WHERE repo_name IN ( 'tensorflow/tensorflow', 'facebook/react', 'twbs/bootstrap', 'apple/swift', 'Microsoft/vscode', 'torvalds/linux')
                   GROUP BY repo
                   )
                   SELECT commits.repo, commits.num_committers, files.num_files
                   FROM commits 
                   INNER JOIN files
                       ON commits.repo = files.repo
                   ORDER BY repo      
                   
```

The time difference is not significant for this particular query, but if we run it again and again, the difference will add up.

Time to run: 13.028 seconds <br>
Time to run: 4.413 seconds <br /><br />


## Conclusion


When I was first learning about SQL, it was in PostgreSQL, which famously does not have arrays built in, so I was quite surprised that they actually exist. Additionally, the idea of nesting data seems logical in order to keep the database schemas more simple – having to do a myriad of `JOIN` statements can make queries complex. Lastly, it is also important to track the performance of queries, especially if they are ran on a frequent bases, and attempt to optimize with these principles or just common sense. <br />
<br />
<br />
<br />


## References
1. [Advanced SQL]( https://www.kaggle.com/learn/advanced-sql) by Alexis Cook on Kaggle









