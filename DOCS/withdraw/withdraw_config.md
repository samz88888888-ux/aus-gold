
##### 简要描述
  - 无

##### 请求URL

  - `{{host}}api/v1/withdraw/withdrawConfig`

##### 请求方式
  - get

##### Header

|字段名|示例值|必选|类型|说明|
|:-----|:-----|:-----|:-----|:-----|
|Authorization|Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOi8vYXBpLm1jZ2RhcHAuY29tL2FwaS92MS9hdXRoL2xvZ2luIiwiaWF0IjoxNzc3MzA1OTAzLCJleHAiOjE3NzczMDk1MDMsIm5iZiI6MTc3NzMwNTkwMywianRpIjoiNkttbG5qaTlCWjU4ZkxlOSIsInN1YiI6IjYxIiwicHJ2IjoiMjNiZDVjODk0OWY2MDBhZGIzOWU3MDFjNDAwODcyZGI3YTU5NzZmNyJ9.Os-vhOGXeEfAgBO7jcmvdhTzNmQzuiIfxS-wZYuqMcs|是|string|token|

##### 成功返回示例
```
{
  "code": 200,
  "local": "TW",
  "message": "",
  "data": {
    "usdt_mine_config": {
      "min_withdraw": "1",
      "max_withdraw": "10000",
      "withdraw_enable": 1,
      "daily_max_withdraw": 100,
      "coin_price": "2.000000000000000000",
      "day_list": [
        {
          "id": 1,
          "day": 1,
          "fee_rate": "20"
        },
        {
          "id": 2,
          "day": 10,
          "fee_rate": "15"
        },
        {
          "id": 3,
          "day": 20,
          "fee_rate": "10"
        },
        {
          "id": 4,
          "day": 30,
          "fee_rate": "5"
        },
        {
          "id": 5,
          "day": 40,
          "fee_rate": "0"
        }
      ]
    },
    "usdt_config": {
      "min_withdraw": "1",
      "max_withdraw": "10000",
      "withdraw_enable": 1,
      "daily_max_withdraw": 100,
      "coin_price": "1",
      "fee_rate": "0"
    }
  }
}
   ```
   
##### 成功返回示例的参数说明

|参数名|类型|说明|
|:-----|:-----|:-----|
|code|string|无|
|local|string|无|
|message|string|无|
|data|array|无|
|usdt_mine_config|object|USDT(算力产出)配置|
|usdt_mine_config.min_withdraw|string|最低提币金额|
|usdt_mine_config.max_withdraw|string|最大提币金额|
|usdt_mine_config.withdraw_enable|string|是否可提币0否1是|
|usdt_mine_config.daily_max_withdraw|string|每日提币次数|
|usdt_mine_config.coin_price|string|代币价格(1U=n个AUS)|
|usdt_mine_config.day_list|array|提币配置列表|
|usdt_mine_config.day_list.id|string|配置ID|
|usdt_mine_config.day_list.day|string|到账天数|
|usdt_mine_config.day_list.fee_rate|string|手续费率|
|usdt_config|object|USDT配置|
|usdt_config.min_withdraw|string|无|
|usdt_config.max_withdraw|string|无|
|usdt_config.withdraw_enable|string|无|
|usdt_config.daily_max_withdraw|string|无|
|usdt_config.coin_price|string|无|
|usdt_config.fee_rate|string|手续费率|

##### 备注

  
