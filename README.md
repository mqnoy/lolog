# Lolog
me and the logs.

## Introduction
Ease to logging your app with wrapping winston to own logger class which called `Lolog`

Supported level:
1. error
1. warn
1. info
1. debug

Available transports
1. ConsoleTransport
1. FileTransport


## Usage
```
this.logger = new Logger({
      level: "debug",
      defaultMeta: { service: "APP" },
      format,
      transports: [Transports.ConsoleTransport()],
    });
```


## Output

Elastic format
```
{
    "@timestamp": "2025-05-04T11:59:46.972Z",
    "data": [
        1,
        2,
        3
    ],
    "ecs.version": "8.10.0",
    "error": {
        "message": "duarrr",
        "stack_trace": "Error\n    at HttpException (.../src/example/....."
        "type": "HttpException"
    },
    "event.dataset": "AppChild",
    "log.level": "error",
    "message": "duarrr",
    "request.id": "abc123",
    "service": "APP",
    "service.name": "AppChild",
    "userId": "u456"
}
```

Printf format
```
[2025-05-04T13:10:41.054Z] [ERROR]: duarrr
Error
    at HttpException (..../lolog/example/basic.ts:12:18)....
meta: {
  "request.id": "abc123",
  "data": [
    1,
    2,
    3
  ],
  "userId": "u456",
  "service": "APP"
}
```


## TODO
- [ ] well documented
- [ ] unit test
- [ ] integrate with any log agent 
- [ ] 