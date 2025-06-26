import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import * as moment from 'moment';
import 'moment/locale/id';
import * as numeral from 'numeral';

@Injectable()
export class UtilityService {

    secretKey = Buffer.from('0123456789abcdef0123456789abcdef', 'utf-8');
    iv = Buffer.from('abcdef0123456789', 'utf-8'); // 16 bytes

    convertFiltersToQuery(filters: any[], withoutWhere?: boolean): string {
        const duplicateFilters = filters.map((item) => {
            return `${item.key} ${item.type} ${item.type == 'BETWEEN' ? "'" + item.searchText1 + "'" + ' and ' + "'" + item.searchText2 + "'" : item.searchText1}`
        });

        return withoutWhere ? `${duplicateFilters.join(" and ")}` : `WHERE ${duplicateFilters.join(" and ")}`;
    }

    onEncrypt(text: string): string {
        const cipher = crypto.createCipheriv('aes-256-cbc', this.secretKey, this.iv);
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return `${this.iv.toString('hex')}:${encrypted}`; // Store IV with encrypted data
    }

    onDecrypt(token: string): any {
        const [ivHex, encrypted] = token.split(':');
        const decipher = crypto.createDecipheriv('aes-256-cbc', this.secretKey, Buffer.from(ivHex, 'hex'));
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return JSON.parse(decrypted);
    }

    onFormatDate(date: Date, format?: string): any {
        moment.locale('id');
        return format ? moment(date).format(format) : moment(date).format('yyyy-mm-DD HH:mm:ss');
    }

    onFormatCurrency(number: any): any {
        return `Rp${numeral(number).format('0,0')}`;
    }
}
