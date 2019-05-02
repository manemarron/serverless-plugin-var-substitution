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
        - stageVariables.ConnectionId
        - search: something_random
          replace: something_more_random
Resources:
    ApiGatewayRestApi:
        Type: AWS::ApiGateway::Deployment
        Properties:
            Body:
                paths:
                    '/some/path':
                        get:
                            x-amazon-apigateway-integration:
                                connectionId: ##stageVariables.ConnectionId##
                                otherProperty: ##something_random##
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
        - 'some string word'
        - search: 'some word'
          replace: 'some other word'
...
```

For the above example, the plugin would search for all occurences in the compiled CloudFormation template of &&some string word&& and replace them for ${some string word} and also all occurences of &&some word&& and replace them with `some other word`.

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

## Configuration
The plugin can be configured by setting the next parameters in the `custom.varSubstitution` object:
- **pattern**: String. The prefix and suffix that will be searched for. Defaults to '##'.
- **variables**: Array. The words that will be searched for to replace. Can be of 2 types:
    - String. Searches for the word and replaces it with ${word}

    ```yaml
    varSubstitution:
        variables:
        - 'some word'  # transformed to ${some word}
    ```

    - Object. Searches for the word in the 'search' property and replaces it with the word in the replace property.


    ```yaml
    varSubstitution:
        variables:
        - search: 'some word'  # transformed to 'some other word'
          replace: 'some other word'
    ```
## More Info
Heavily influenced by [serverless-plugin-time-substitution](https://github.com/manemarron/serverless-plugin-time-substitution)
