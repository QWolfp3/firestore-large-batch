import * as firestore from "@google-cloud/firestore";

export class LargeBatch {
  private firestoreInstance: firestore.Firestore;
  private batches: Array<firestore.WriteBatch>;
  private operationCount = 0;

  constructor(firestoreInstance: firestore.Firestore) {
    this.firestoreInstance = firestoreInstance;
    this.batches = [firestoreInstance.batch()];
  }

  private currentBatch() {
    this.operationCount++;
    const batch = this.batches.at(-1);
    if (!batch) {
      throw Error();
    }
    if (this.operationCount == 500) {
      this.batches.push(this.firestoreInstance.batch());
      this.operationCount = 0;
    }
    return batch;
  }

  public create<T>(documentRef: firestore.DocumentReference<T>, data: T) {
    this.currentBatch().create(documentRef, data);
  }

  public set<T>(
    documentRef: firestore.DocumentReference<T>,
    data: Partial<T> | firestore.WithFieldValue<T>,
    options?: firestore.SetOptions | undefined
  ) {
    if (options) {
      this.currentBatch().set(documentRef, data, options);
    } else {
      this.currentBatch().set(documentRef, data as firestore.WithFieldValue<T>);
    }
  }

  public update<T>(
    documentRef: firestore.DocumentReference<T>,
    data: firestore.UpdateData<T>,
    precondition?: firestore.Precondition
  ) {
    if (precondition) {
      this.currentBatch().update<T>(documentRef, data, precondition);
    } else {
      this.currentBatch().update<T>(documentRef, data);
    }
  }

  public updateField(
    documentRef: firestore.DocumentReference<unknown>,
    field: string | firestore.FieldPath,
    value: unknown,
    ...fieldsOrPrecondition: unknown[]
  ) {
    this.currentBatch().update(
      documentRef,
      field,
      value,
      ...fieldsOrPrecondition
    );
  }

  public delete(
    documentRef: firestore.DocumentReference<unknown>,
    precondition?: firestore.Precondition
  ) {
    this.currentBatch().delete(documentRef, precondition);
  }

  public async commit(commitUnit?: number) {
    if (!commitUnit) {
      await this.commitBatches(this.batches);
    } else {
      const slicedBatches = Array<Array<firestore.WriteBatch>>();
      for (let i = 0; i < this.batches.length; i += commitUnit) {
        const chunk = this.batches.slice(i, i + commitUnit);
        slicedBatches.push(chunk);
      }
      for (const batches of slicedBatches) {
        await this.commitBatches(batches);
      }
    }
  }

  private async commitBatches(batches: Array<firestore.WriteBatch>) {
    await Promise.all(batches.map((batch) => batch.commit()));
    this.batches = [];
    this.operationCount = 0;
  }
}
