import yaml from 'js-yaml';

const parseStringToYaml = (yamlString: string): any => {
    return yaml.load(yamlString);
}

const parseObjectToYamlString = (object: any): string => {
    return yaml.dump(object, {lineWidth: -1});
}

export {
    parseStringToYaml,
    parseObjectToYamlString
}