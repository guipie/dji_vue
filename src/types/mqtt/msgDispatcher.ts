import { Message, MethodType } from './message';
import { MessageHandler } from './msgHandle';

export class MessageDispatcher {
	private handlers = new Map<MethodType, MessageHandler<BaseModel, MethodType>>();

	register<D extends BaseModel, M extends MethodType>(type: M, handler: MessageHandler<BaseModel, MethodType>) {
		this.handlers.set(type, handler);
	}

	dispatch(message: Message<BaseModel, MethodType>): void {
		const handler = this.handlers.get(message.method);
		if (handler) {
			// 类型断言 + 安全调用
			(handler as MessageHandler<any, any>).handle(message as any);
		} else {
			console.warn(`No handler for message type: ${(message.method, message.topic)}`);
		}
	}
}
