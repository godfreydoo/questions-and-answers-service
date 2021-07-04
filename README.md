# questions-and-answers-service
Web API server to support the demands of production traffic for a 'Questions and Answers' widget of a mock e-commerce website. API endpoints include reading, updating, and inserting new data.  


## Overview
* ETL process to import and manage 12 million records of data
* Optimized database queries and tuning of Postgres database for fast response times
* Deployed across multiple AWS EC2 t2.micro instances to support horizontal scaling
* Added NGINX load balancer and reverse proxy with optimized configurations for maximum throughput and latency
* Configured NGINX caching to increase data retreival performance for heavy read requests
* Load testing done on [Loader](https://loader.io/) and with [k6](https://k6.io/)
* Created my own [tool](https://github.com/godfreydoo/retrieve-loaderio-test-data) to programatically run load tests and capture results for accurate measurements 


## Results
Maintaining 1,000 simultaneous clients per second making continuous requests over a 30 second duration, application can support on average across all endpoints
* 9.5k successful responses per second
* 232ms latency
* less than 1% error rate

2,000 simultaenous clients per second
* 6.7k successful responses per second
* 478ms latency
* less than 1% error rate
