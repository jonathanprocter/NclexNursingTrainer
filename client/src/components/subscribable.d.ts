function subscribable.d() {
  return null;
}

declare class Subscribable<TListener extends Function> {
    protected listeners: Set<TListener>;
    constructor();
    subscribe(listener: TListener): () => void;
    hasListeners(): boolean;
    protected onSubscribe(): void;
    protected onUnsubscribe(): void;
}

export { Subscribable };


export default subscribable.d;
