import { CustomNamingStrategy } from '@/common/strategy/custom-naming-strategy';
import { warnMissingEnvVars } from '@/config/config-warning.util';
import { registerAs } from '@nestjs/config';
import { MysqlConnectionOptions } from 'typeorm/driver/mysql/MysqlConnectionOptions';

export default registerAs('db', (): MysqlConnectionOptions => {
  const hostEnv = process.env.DATASOURCE_HOST;
  const portEnv = process.env.DATASOURCE_PORT;
  const usernameEnv = process.env.DATASOURCE_USER;
  const passwordEnv = process.env.DATASOURCE_PWD;
  const databaseEnv = process.env.DATASOURCE_SCHEMA;

  warnMissingEnvVars('db', {
    DATASOURCE_HOST: hostEnv,
    DATASOURCE_PORT: portEnv,
    DATASOURCE_USER: usernameEnv,
    DATASOURCE_PWD: passwordEnv,
    DATASOURCE_SCHEMA: databaseEnv,
  });

  return {
    type: 'mysql',
    host: hostEnv ?? 'localhost',
    port: parseInt(portEnv ?? '3306', 10) || 3306,
    username: usernameEnv ?? 'root',
    password: passwordEnv,
    database: databaseEnv,
    timezone: 'Z',
    // entityPrefix: 'lh_cs__', // 모든 엔티티에 prefix 추가하는 방법 -> CustomNamingStrategy 로 대체
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    namingStrategy: new CustomNamingStrategy(),
    synchronize: false,
    logging: false, // TODO: 배포전 활성화
    // logging: true,
    charset: 'utf8mb4',
  };
});
