import {DataSource} from 'typeorm'
import typeormOptions from './typeorm.options'

function buildTypeormMigrationConfig(): DataSource {
  return new DataSource(typeormOptions)
}

export default buildTypeormMigrationConfig()
