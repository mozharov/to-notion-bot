import {DataSource as TypeOrmDataSource} from 'typeorm'
import typeormOptions from './typeorm.options'

export const DataSource = new TypeOrmDataSource(typeormOptions)
