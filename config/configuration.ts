import { readFileSync } from 'fs';
import { load } from 'js-yaml';

const YAML_CONFIG_FILENAME = '.env.yaml';

export default () =>
    load(readFileSync(YAML_CONFIG_FILENAME, 'utf8')) as Record<string, any>
