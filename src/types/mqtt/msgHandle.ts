import { Message, MethodType } from './message';

export interface MessageHandler<D extends BaseModel, M extends MethodType> {
	handle(message: Message<D, M>): void;
}
