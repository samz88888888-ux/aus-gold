
##### 简要描述
  - 无

##### 请求URL

  - `{{host}}api/v1/withdraw/index`

##### 请求方式
  - post

##### Header

|字段名|示例值|必选|类型|说明|
|:-----|:-----|:-----|:-----|:-----|
|Authorization|Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOi8vYXBpLm1jZ2RhcHAuY29tL2FwaS92MS9hdXRoL2xvZ2luIiwiaWF0IjoxNzc3MzA1OTAzLCJleHAiOjE3NzczMDk1MDMsIm5iZiI6MTc3NzMwNTkwMywianRpIjoiNkttbG5qaTlCWjU4ZkxlOSIsInN1YiI6IjYxIiwicHJ2IjoiMjNiZDVjODk0OWY2MDBhZGIzOWU3MDFjNDAwODcyZGI3YTU5NzZmNyJ9.Os-vhOGXeEfAgBO7jcmvdhTzNmQzuiIfxS-wZYuqMcs|是|string|token|

##### 请求Body参数

|参数名|示例值|必选|类型|说明|
|:-----|:-----|:-----|:-----|:-----|
|num|100|是|string|提币数量|
|coin_type|1|是|string|提现余额类型 1-USDT,2-USDT(挖矿)|
|conf_id||是|string|2-USDT(挖矿) 必选|

##### 成功返回示例
```
{
  "code": 200,
  "local": "TW",
  "message": "",
  "data": []
}
   ```
   
##### 成功返回示例的参数说明

|参数名|类型|说明|
|:-----|:-----|:-----|
|code|string|无|
|local|string|无|
|message|string|无|
|data|array|无|

##### 备注

  

