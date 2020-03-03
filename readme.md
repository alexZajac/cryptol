# Cryptol

A cryptocurrency monitoring app made with React, TypeScript and Go.

## Demo screens

You can monitor prices of several cryptocurrencies **concurrently**, by checking a condition on either **above/below** certain amount or with an **X% increase/decrease** over a given **timeframe**.

On the below example, we want to monitor a _min 0.004% increase_ of the BTC value on a timeframe of _less than 5 minutes_.

![](start.png)

A **dark mode** is implemented, as long as an overall **responsiveness** for mobile devices. Below is a snpashot of the **BTC monitoring** running.

![](https://raw.githubusercontent.com/alexZajac/cryptol/master/dark.PNG)

Once the alert is met, you will receive an **email** indicating the specific met conditions. Here is an example below: 

![](./email.png)

## Instructions
Launch the app in dev mode:

From the root directory

```
docker-compose up --build
```
