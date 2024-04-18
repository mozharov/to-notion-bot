import {DataSource} from 'typeorm'
import typeormOptions from './typeorm.options'
import {Migration1713375518739} from './migrations/1713375518739-migration'

function buildTypeormMigrationConfig(): DataSource {
  return new DataSource({...typeormOptions, migrations: [Migration1713375518739]})
}

export default buildTypeormMigrationConfig()
