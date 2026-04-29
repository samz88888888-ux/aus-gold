
##### 简要描述
  - 无

##### 请求URL

  - `{{host}}api/v1/withdraw/list`

##### 请求方式
  - get

##### Header

|字段名|示例值|必选|类型|说明|
|:-----|:-----|:-----|:-----|:-----|
|Authorization|Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOi8vYXBpLm1jZ2RhcHAuY29tL2FwaS92MS9hdXRoL2xvZ2luIiwiaWF0IjoxNzc3MzA1OTAzLCJleHAiOjE3NzczMDk1MDMsIm5iZiI6MTc3NzMwNTkwMywianRpIjoiNkttbG5qaTlCWjU4ZkxlOSIsInN1YiI6IjYxIiwicHJ2IjoiMjNiZDVjODk0OWY2MDBhZGIzOWU3MDFjNDAwODcyZGI3YTU5NzZmNyJ9.Os-vhOGXeEfAgBO7jcmvdhTzNmQzuiIfxS-wZYuqMcs|是|string|token|

##### 请求Query参数

|参数名|示例值|必选|类型|说明|
|:-----|:-----|:-----|:-----|:-----|
|page|1|是|string|无|
|page_size|10|是|string|无|

##### 成功返回示例
```
{
  "code": 200,
  "local": "TW",
  "message": "",
  "data": {
    "list": [
      {
        "id": 15,
        "no": "W2026042723221545905819",
        "coin_type": 1,
        "total_day": 1,
        "wait_day": 1,
        "num": "100.000000",
        "fee": "0.000000",
        "fee_amount": "0.000000",
        "ac_amount": "100.000000",
        "real_coin_id": 1,
        "real_num": "100.000000",
        "real_fee_amount": "0.000000",
        "real_ac_amount": "100.000000",
        "coin_price": "1.0000000000",
        "status": 0,
        "created_at": "2026-04-27 23:22:15"
      },
      {
        "id": 14,
        "no": "W2026042723211280345969",
        "coin_type": 2,
        "total_day": 3,
        "wait_day": 3,
        "num": "100.000000",
        "fee": "0.150000",
        "fee_amount": "15.000000",
        "ac_amount": "85.000000",
        "real_coin_id": 3,
        "real_num": "200.000000",
        "real_fee_amount": "30.000000",
        "real_ac_amount": "170.000000",
        "coin_price": "2.0000000000",
        "status": 0,
        "created_at": "2026-04-27 23:21:12"
      },
      {
        "id": 13,
        "no": "W2026042723185460301351",
        "coin_type": 2,
        "total_day": 10,
        "wait_day": 10,
        "num": "1000.000000",
        "fee": "0.150000",
        "fee_amount": "150.000000",
        "ac_amount": "850.000000",
        "real_coin_id": 3,
        "real_num": "2000.000000",
        "real_fee_amount": "300.000000",
        "real_ac_amount": "1700.000000",
        "coin_price": "2.0000000000",
        "status": 0,
        "created_at": "2026-04-27 23:18:54"
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
|list.no|string|订单号|
|list.coin_type|string|提现余额类型 1-USDT,2-USDT(挖矿)|
|list.total_day|string|到账天数|
|list.wait_day|string|剩余到账天数|
|list.num|string|提币数量|
|list.fee|string|手续费率|
|list.fee_amount|string|手续费金额|
|list.ac_amount|string|实际到账金额|
|list.real_coin_id|string|真实到账币种1USDT,2PYTHIA,3AUS|
|list.real_num|string|真实出金数量|
|list.real_fee_amount|string|真实手续费用|
|list.real_ac_amount|string|真实到账金额|
|list.coin_price|string|无|
|list.status|string|状态 0-提现中 1已完成 2已退款|
|list.created_at|string|无|
|total|string|数量|

##### 备注

  
