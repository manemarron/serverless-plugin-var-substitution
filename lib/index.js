'use strict';

const defaultPattern = '##'
const hook = 'after:aws:package:finalize:mergeCustomProviderResources';

module.exports = class ServerlessPluginVarSubstitution {
    constructor(serverless) {
        this.serverless = serverless;
        this.pattern = getPattern(this.serverless.service);
        this.variables = getVariables(this.serverless.service);
        this.handle = this.handle.bind(this);
        this.hooks = {
            [hook]: this.handle,
        };
    }

    handle() {
        const template = this.serverless.service.provider.compiledCloudFormationTemplate;
        let processedTemplate = JSON.stringify(template);
        for (let variable of this.variables) {
            let { search, replace } = variable;
            if (typeof variable === 'string') {
                search = variable;
                replace = `\${${variable}}`;
            }
            search = new RegExp((search && replace) ? `${this.pattern}${search.toString()}${this.pattern}` : '$^', 'g');
            replace = replace && replace.toString();
            this.log(`Substituting ${search} in CloudFormation template`);
            processedTemplate = processedTemplate.replace(search, replace);
        }
        this.serverless.service.provider.compiledCloudFormationTemplate = JSON.parse(processedTemplate);
    }

    log(message) {
        this.serverless.cli.log(message, ServerlessPluginVarSubstitution.name);
    }
};

function getPattern(service) {
    const pattern = (service.custom && service.custom.varSubstitution)
        ? service.custom.varSubstitution.pattern
        : null;
    return pattern ? pattern.toString() : defaultPattern;
}

function getVariables(service) {
    const variables = (service.custom && service.custom.varSubstitution)
        ? service.custom.varSubstitution.variables
        : null;
    return Array.isArray(variables) ? variables : [];
}
