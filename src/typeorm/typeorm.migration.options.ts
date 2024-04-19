import {DataSource} from 'typeorm'
import typeormOptions from './typeorm.options'
import {Migration1713375518739} from './migrations/1713375518739-migration'
import {Migration1713442865423} from './migrations/1713442865423-migration'
import {Migration1713526079330} from './migrations/1713526079330-migration'

function buildTypeormMigrationConfig(): DataSource {
  return new DataSource({
    ...typeormOptions,
    migrations: [Migration1713375518739, Migration1713442865423, Migration1713526079330],
  })
}

export default buildTypeormMigrationConfig()
