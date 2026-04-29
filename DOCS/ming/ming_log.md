
##### 简要描述
  - 无

##### 请求URL

  - `{{host}}api/v1/user/powerLog`

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
        "id": 3,
        "user_id": 59,
        "from_user_id": 0,
        "type": 1,
        "cate": 5,
        "total": "300.000000",
        "msg": "代币销毁",
        "content": "代币销毁",
        "ordernum": "DM20260426143029253049",
        "created_at": "2026-04-26 14:30:29",
        "updated_at": "2026-04-26 14:30:29"
      },
      {
        "id": 2,
        "user_id": 59,
        "from_user_id": 0,
        "type": 1,
        "cate": 4,
        "total": "8149.000000",
        "msg": "购买黄金",
        "content": "购买黄金",
        "ordernum": "MT202604252255516211",
        "created_at": "2026-04-25 22:55:51",
        "updated_at": "2026-04-25 22:55:51"
      },
      {
        "id": 1,
        "user_id": 59,
        "from_user_id": 0,
        "type": 1,
        "cate": 3,
        "total": "50000.000000",
        "msg": "购买节点",
        "content": "购买节点",
        "ordernum": "SUB20260425220706KPYEITUP",
        "created_at": "2026-04-25 22:07:18",
        "updated_at": "2026-04-25 22:07:18"
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
|data|array|无|
|list|array|无|
|list.id|string|无|
|list.user_id|string|无|
|list.from_user_id|string|无|
|list.type|string|类型1增加2扣除|
|list.cate|string|无|
|list.total|string|数量|
|list.msg|string|无|
|list.content|string|无|
|list.ordernum|string|无|
|list.created_at|string|时间|
|list.updated_at|string|无|
|total|string|数量|

##### 备注

  

