'use strict';
const Plugin = require('.');

describe('Plugin', () => {
    describe('constructor', () => {
        const template = { foo: 'bar' };
        let serverless;

        beforeEach(() => {
            serverless = {
                pluginManager: { hooks: {}},
                service: {
                    provider: {
                        compiledCloudFormationTemplate: template,
                    },
                },
            };
        });

        it('should set serverless property of instance', () => {
            // Act
            const instance = new Plugin(serverless);

            // Assert
            expect(instance.serverless).toEqual(serverless);
        });

        it('should set correct hook in serverless instance', () => {
            // Act
            const instance = new Plugin(serverless);

            // Assert
            expect(instance.hooks).toEqual({
                'after:aws:package:finalize:mergeCustomProviderResources': instance.handle,
            });
        });

        it('should set default pattern if serverless.service.custom property is not defined', () => {
            // Arrange
            serverless.service.custom = null;

            // Act
            const instance = new Plugin(serverless);

            // Assert
            expect(instance.pattern).toEqual('##');
        });

        it('should set default pattern if serverless.service.custom.varSubstitution property is not defined', () => {
            // Arrange
            serverless.service.custom = {};

            // Act
            const instance = new Plugin(serverless);

            // Assert
            expect(instance.pattern).toEqual('##');
        });

        it('should set default pattern if serverless.service.custom.varSubstitution.pattern property is not defined', () => {
            // Arrange
            serverless.service.custom = {
                varSubstitution: {},
            };

            // Act
            const instance = new Plugin(serverless);

            // Assert
            expect(instance.pattern).toEqual('##');
        });

        it('should set configured pattern if serverless.service.custom.varSubstitution.pattern is present', () => {
            // Arrange
            serverless.service.custom = {
                varSubstitution: {
                    pattern: 'some pattern',
                },
            };

            // Act
            const instance = new Plugin(serverless);

            // Assert
            expect(instance.pattern).toEqual('some pattern');
        });

        it('should set variables = [] if serverless.service.custom property is not defined', () => {
            // Arrange
            serverless.service.custom = null;

            // Act
            const instance = new Plugin(serverless);

            // Assert
            expect(instance.variables).toEqual([]);
        });

        it('should set variables = [] if serverless.service.custom.varSubstitution property is not defined', () => {
            // Arrange
            serverless.service.custom = {};

            // Act
            const instance = new Plugin(serverless);

            // Assert
            expect(instance.variables).toEqual([]);
        });

        it('should set variables = [] if serverless.service.custom.varSubstitution.variables property is not defined', () => {
            // Arrange
            serverless.service.custom = {
                varSubstitution: {},
            };

            // Act
            const instance = new Plugin(serverless);

            // Assert
            expect(instance.variables).toEqual([]);
        });

        it('should set configured variables if serverless.service.custom.varSubstitution.variables property is present', () => {
            // Arrange
            const expectedVariables = [ 'hello' ];
            serverless.service.custom = {
                varSubstitution: {
                    variables: expectedVariables,
                },
            };

            // Act
            const instance = new Plugin(serverless);

            // Assert
            expect(instance.variables).toEqual(expectedVariables);
        });
    });

    describe('handle', () => {
        let systemUnderTest;

        beforeEach(() => {
            const serverless = {
                cli: {},
                pluginManager: { hooks: {}},
                service: {},
            };
            systemUnderTest = new Plugin(serverless);
            systemUnderTest.log = jest.fn();
        });

        it('should replace variables correctly', () => {
            // Arrange
            systemUnderTest.variables = [
                { search: 'hello', replace: 'foo' },
                { search: 'world', replace: 'bar' },
            ];
            systemUnderTest.pattern = '##';
            systemUnderTest.serverless = {
                service: {
                    provider: {
                        compiledCloudFormationTemplate: {
                            key: '##hello## ##world##',
                            '##hello##': 'something',
                            '##world##': 'anything',
                        },
                    },
                },
            };

            // Act
            systemUnderTest.handle();

            // Assert
            expect(systemUnderTest.serverless.service.provider.compiledCloudFormationTemplate).toEqual({
                key: 'foo bar',
                foo: 'something',
                bar: 'anything',
            });
        });

        it('should not replace "hello" if variable is {"replace": "world"}', () => {
            // Arrange
            systemUnderTest.pattern = '##';
            systemUnderTest.serverless = {
                service: {
                    provider: {
                        compiledCloudFormationTemplate: {
                            key: '##hello## world',
                        },
                    },
                },
            };
            systemUnderTest.variables = [
                { replace: 'world'},
            ];

            // Act
            systemUnderTest.handle();

            // Assert
            expect(systemUnderTest.serverless.service.provider.compiledCloudFormationTemplate).toEqual({
                key: '##hello## world',
            });
        });

        it('should not replace "hello" if variable is {"search": "hello"}', () => {
            // Arrange
            systemUnderTest.pattern = '##';
            systemUnderTest.serverless = {
                service: {
                    provider: {
                        compiledCloudFormationTemplate: {
                            key: '##hello## world',
                        },
                    },
                },
            };
            systemUnderTest.variables = [
                { search: 'hello'},
            ];

            // Act
            systemUnderTest.handle();

            // Assert
            expect(systemUnderTest.serverless.service.provider.compiledCloudFormationTemplate).toEqual({
                key: '##hello## world',
            });
        });
    });

    describe('log', () => {
        let systemUnderTest;

        beforeEach(() => {
            const serverless = {
                cli: { log: jest.fn() },
                pluginManager: { hooks: {}},
                service: {},
            };
            systemUnderTest = new Plugin(serverless);
        });

        it('should call serverless.cli.log with message and class name', () => {
            // Arrange
            const message = 'some message';

            // Act
            systemUnderTest.log(message);

            // Assert
            expect(systemUnderTest.serverless.cli.log).toHaveBeenCalledWith(message, 'ServerlessPluginVarSubstitution');
        });
    });
});
