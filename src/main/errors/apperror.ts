import { IDisplayText } from '../types';
import { ApiProperty } from '@nestjs/swagger';

export class IAppError {
    @ApiProperty()
    code: string;
    @ApiProperty()
    message: string;
    @ApiProperty({ required: false, type: [IDisplayText] })
    display_messages?: Array<IDisplayText>;
    @ApiProperty({ required: false })
    details?: any;
    @ApiProperty({ required: false })
    status_code?: number | null;
    @ApiProperty({ required: false })
    url?: string | null;
}

export class IAppErrorDto {
    @ApiProperty({ type: IAppError })
    error: IAppError;
}

export interface IAppErrorDictionary {
    [key: string]: IAppError;
}

export function isAppErrorObject(o: unknown): o is IAppError {
    return o !== null && typeof o === 'object' && 'code' in (o as any) && 'message' in (o as any);
}
