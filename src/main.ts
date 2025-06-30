import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaService } from './prisma.service';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as bodyParser from 'body-parser';
import { DtoExceptionsFilter } from './helper/filter/dto-exception.filter';
import { CustomValidationPipe } from './helper/filter/custom-validation.pipe';
import { NestExpressApplication } from '@nestjs/platform-express';
declare const module: any;

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);;
    app.setGlobalPrefix('api/v1');

    const prisma = app.get(PrismaService);
    await prisma.enableShutdownHooks(app);

    app.use(bodyParser.json({ limit: '10mb' }));
    app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

    const config = new DocumentBuilder()
        .setTitle('Unggas Berjaya Backoffice System')
        .setDescription('Unggas Berjaya Webservice v0.0.1')
        .setVersion('1.0')
        .addTag('api')
        .addBearerAuth(
            { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
            'token'
        )
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('swagger', app, document, {
        swaggerOptions: {
            persistAuthorization: true,
            docExpansion: "none"
        },
    });

    app.useGlobalPipes(new CustomValidationPipe());
    app.useGlobalFilters(new DtoExceptionsFilter());
    app.set('trust proxy', true)

    app.enableCors();
    await app.listen(process.env.PORT);

    if (module.hot) {
        module.hot.accept();
        module.hot.dispose(() => app.close());
    }
}
bootstrap();
