
##### 简要描述
  - 无

##### 请求URL

  - `{{host}}api/v1/withdraw/itemList`

##### 请求方式
  - get

##### Header

|字段名|示例值|必选|类型|说明|
|:-----|:-----|:-----|:-----|:-----|
|Authorization|Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOi8vYXBpLm1jZ2RhcHAuY29tL2FwaS92MS9hdXRoL2xvZ2luIiwiaWF0IjoxNzc3MzA1OTAzLCJleHAiOjE3NzczMDk1MDMsIm5iZiI6MTc3NzMwNTkwMywianRpIjoiNkttbG5qaTlCWjU4ZkxlOSIsInN1YiI6IjYxIiwicHJ2IjoiMjNiZDVjODk0OWY2MDBhZGIzOWU3MDFjNDAwODcyZGI3YTU5NzZmNyJ9.Os-vhOGXeEfAgBO7jcmvdhTzNmQzuiIfxS-wZYuqMcs|是|string|token|

##### 请求Query参数

|参数名|示例值|必选|类型|说明|
|:-----|:-----|:-----|:-----|:-----|
|wid|14|是|string|主订单ID|

##### 成功返回示例
```
{
  "code": 200,
  "local": "TW",
  "message": "",
  "data": {
    "list": [
      {
        "id": 11,
        "wid": 14,
        "user_id": 61,
        "ordernum": "WI61202604272321121111",
        "address": "0x873e782d641c12e985af30797182ecc15f7a44b8",
        "status": 0,
        "day": "2026-04-28",
        "num": "33.333333",
        "fee": "0.150000",
        "fee_amount": "5.000000",
        "ac_amount": "28.333333",
        "real_coin_id": 3,
        "real_num": "66.666666",
        "real_fee_amount": "10.000000",
        "real_ac_amount": "56.666666",
        "coin_price": "2.0000000000",
        "finsh_time": "",
        "push_time": "2026-04-28 23:21:12",
        "is_push": 0,
        "hash": "",
        "created_at": "2026-04-27 23:21:12",
        "updated_at": "2026-04-27 23:21:12"
      },
      {
        "id": 12,
        "wid": 14,
        "user_id": 61,
        "ordernum": "WI61202604272321121112",
        "address": "0x873e782d641c12e985af30797182ecc15f7a44b8",
        "status": 0,
        "day": "2026-04-29",
        "num": "33.333333",
        "fee": "0.150000",
        "fee_amount": "5.000000",
        "ac_amount": "28.333333",
        "real_coin_id": 3,
        "real_num": "66.666666",
        "real_fee_amount": "10.000000",
        "real_ac_amount": "56.666666",
        "coin_price": "2.0000000000",
        "finsh_time": "",
        "push_time": "2026-04-29 23:21:12",
        "is_push": 0,
        "hash": "",
        "created_at": "2026-04-27 23:21:12",
        "updated_at": "2026-04-27 23:21:12"
      },
      {
        "id": 13,
        "wid": 14,
        "user_id": 61,
        "ordernum": "WI61202604272321121113",
        "address": "0x873e782d641c12e985af30797182ecc15f7a44b8",
        "status": 0,
        "day": "2026-04-30",
        "num": "33.333334",
        "fee": "0.150000",
        "fee_amount": "5.000000",
        "ac_amount": "28.333334",
        "real_coin_id": 3,
        "real_num": "66.666668",
        "real_fee_amount": "10.000000",
        "real_ac_amount": "56.666668",
        "coin_price": "2.0000000000",
        "finsh_time": "",
        "push_time": "2026-04-30 23:21:12",
        "is_push": 0,
        "hash": "",
        "created_at": "2026-04-27 23:21:12",
        "updated_at": "2026-04-27 23:21:12"
      }
    ],
    "total": 3
  }
}
   ```
   
##### 成功返回示例的参数说明

|参数名|类型|说明|
|:-----|:-----|:-----|
|code|string|无|
|local|string|无|
|message|string|无|
|data|object|无|
|list|array|无|
|list.id|string|主订单ID|
|list.wid|string|无|
|list.user_id|string|无|
|list.ordernum|string|无|
|list.address|string|无|
|list.status|string|状态 0-提现中 1已完成 2已退款|
|list.day|string|无|
|list.num|string|提币数量|
|list.fee|string|手续费率|
|list.fee_amount|string|手续费金额|
|list.ac_amount|string|实际到账金额|
|list.real_coin_id|string|真实到账币种1USDT,2PYTHIA,3AUS|
|list.real_num|string|真实出金数量|
|list.real_fee_amount|string|真实手续费用|
|list.real_ac_amount|string|真实到账金额|
|list.coin_price|string|无|
|list.finsh_time|string|无|
|list.push_time|string|无|
|list.is_push|string|无|
|list.hash|string|无|
|list.created_at|string|无|
|list.updated_at|string|无|
|total|string|数量|

##### 备注

  
