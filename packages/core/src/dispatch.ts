//  TODO Move to Util
const { requestAnimationFrame, cancelAnimationFrame } = (function () {
    if (requestAnimationFrame) return { requestAnimationFrame, cancelAnimationFrame };

    let lastTime = 0;
    return {
        requestAnimationFrame(callback: FrameRequestCallback): number {
            const currTime = new Date().getTime();
            const timeToCall = Math.max(0, 16 - (currTime - lastTime));
            const id = setTimeout(() => callback(currTime + timeToCall), timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        },
        cancelAnimationFrame(handle: number): void {
            clearTimeout(handle);
        }
    };
})();

export class Message {

    get canConflate(): boolean { return false; }
    conflate(other: Message): boolean {
        return false;
    }

    void(): boolean {
        return false;
    }
}

type Constructor<T extends Message> = new (...args: any[]) => T;

export type Callback = (messages: Message[]) => void;

interface ObserverAdapter<T extends Message = Message> {
    id: number;
    type?: Constructor<T>;
    callback: Callback;
}

export class Dispatch {

    private _observerID: number = 0;
    private _observers: ObserverAdapter[] = [];
    private _messageBuffer: Message[] = [];

    constructor() {
    }

    private observers(): ObserverAdapter[] {
        return this._observers;
    }

    private messages(): Message[] {
        const retVal: Message[] = [];
        this._messageBuffer.forEach(msg => {
            if (!retVal.some(msg2 => msg2.canConflate && msg2.conflate(msg))) {
                retVal.push(msg);
            }
        });
        return retVal;
    }

    private dispatchAll() {
        this.dispatch(this.messages());
        this.flush();
    }

    private dispatch(messages: Message[]) {
        if (messages.length === 0) return;
        this.observers().forEach(o => {
            const msgs = messages.filter(m => !m.void() && (o.type === undefined || m instanceof o.type));
            if (msgs.length) {
                o.callback(msgs);
            }
        });
    }

    flush() {
        this._messageBuffer = [];
    }

    send(msg: Message) {
        this.dispatch([msg]);
    }

    post(msg: Message) {
        this._messageBuffer.push(msg);
        requestAnimationFrame(() => this.dispatchAll());
    }

    monitor<T extends Message>(callback: Callback, type?: Constructor<T>): { dispose: () => void } {
        const context = this;
        const id = ++this._observerID;
        this._observers.push({ id, type, callback });
        return {
            dispose() {
                context._observers = context._observers.filter(o => o.id !== id);
            }
        };
    }
}