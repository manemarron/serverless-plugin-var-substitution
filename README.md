# serverless-plugin-var-substitution

###
Serverless plugin to substitute variables in compiled cloudformation template

Add a variable substitution syntax so that serverless can maintain the normal syntax.

This is especially useful for stage variables in a swagger definition for Api Gateway.

```yaml
...
custom:
    varSubstitution:
        pattern: '##'
        variables:
        - search: connection_id
          replace: '${stageVariables.ConnectionId}'
Resources:
    ApiGatewayRestApi:
        Type: AWS::ApiGateway::Deployment
        Properties:
            Body:
                paths:
                    '/some/path':
                        get:
                            x-amazon-apigateway-integration:
                                connectionId: ##connection_id##
                        
...
```

You just need to specify a pattern and the variables you will replace. The default pattern is `##`.

The plugin is run after the serverless package command is executed.

The parameters can be configured using the custom section in the serverless.yml file:
```yaml
...
custom:
    varSubstitution:
        pattern: &&
        variables:
        - search: 'some word'
          replace: 'some other word'
...
```

For the above example, the plugin would search for all occurences of &&some word&& in the compiled CloudFormation template and replace them with `some other word`.

## Getting Started
1. Install plugin from npm:
```shell
npm install --save-dev serverless-plugin-var-substitution
```
2. Add to the `plugins` section of your `serverless.yml`:
```yaml
plugins:
  - serverless-plugin-var-substitution
```
3. Include variables in your CloudFormation templates.

## More Info
Heavily influenced by [serverless-plugin-time-substitution](https://github.com/manemarron/serverless-plugin-time-substitution)
