import * as firestore from "@google-cloud/firestore";

/**
 *  LargeBatch allows for batching operations in Firestore.
 */
export class LargeBatch {
  private firestoreInstance: firestore.Firestore;
  private batches: Array<firestore.WriteBatch>;
  private operationCount = 0;

  /**
   * Creates a new instance of the `LargeBatch` class.
   * @param firestoreInstance An instance of Firestore.
   */
  constructor(firestoreInstance: firestore.Firestore) {
    this.firestoreInstance = firestoreInstance;
    this.batches = [firestoreInstance.batch()];
  }

  /**
   * Returns the current batch and if the number of operations in that batch reaches 500, a new batch is added to the array
   */
  private currentBatch() {
    this.operationCount++;
    const batch = this.batches.at(-1);
    if (!batch) {
      const newBatch = this.firestoreInstance.batch();
      this.batches.push(newBatch);
      return newBatch;
    }
    if (this.operationCount == 500) {
      this.batches.push(this.firestoreInstance.batch());
      this.operationCount = 0;
    }
    return batch;
  }

  /**
   * Adds a create operation to the current batch.
   * @param documentRef A Firestore DocumentReference.
   * @param data The data to be added to the document.
   */
  public create<T>(documentRef: firestore.DocumentReference<T>, data: T) {
    this.currentBatch().create(documentRef, data);
  }

  /**
   * Adds a set operation to the current batch.
   * @param documentRef A Firestore DocumentReference.
   * @param data The data to be set on the document.
   * @param options Optional settings to use when setting the document.
   */
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

  /**
   * Adds an update operation to the current batch.
   * @param documentRef A Firestore DocumentReference.
   * @param data The data to be updated on the document.
   * @param precondition An optional precondition to use when updating the document.
   */
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

  /**
   * Adds an update field operation to the current batch.
   * @param documentRef A Firestore DocumentReference.
   * @param field The field to update on the document.
   * @param value The new value of the field.
   * @param fieldsOrPrecondition Additional fields to update on the document, or an optional precondition to use when updating the document.
   */
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

  /**
   * Adds a delete operation to the current batch.
   * @param documentRef A Firestore DocumentReference.
   * @param precondition An optional precondition to use when deleting the document.
   */
  public delete(
    documentRef: firestore.DocumentReference<unknown>,
    precondition?: firestore.Precondition
  ) {
    this.currentBatch().delete(documentRef, precondition);
  }

  /**
   * Commits all batches. Optionally, you can pass a commit unit which controls the number of batches that are committed at a time.
   * @param commitUnit Number of batches to commit at a time.
   */
  public async commit(options?: { commitUnit?: number }) {
    if (!options?.commitUnit) {
      await this.commitBatches(this.batches);
    } else {
      const slicedBatches = Array<Array<firestore.WriteBatch>>();
      for (let i = 0; i < this.batches.length; i += options.commitUnit) {
        const chunk = this.batches.slice(i, i + options.commitUnit);
        slicedBatches.push(chunk);
      }
      for (const batches of slicedBatches) {
        await this.commitBatches(batches);
      }
    }
    this.batches = [];
    this.operationCount = 0;
  }

  /**
   * Commits all batches and reset the batch array and operation count
   * @param batches Array of batches to be committed
   */
  private async commitBatches(batches: Array<firestore.WriteBatch>) {
    await Promise.all(batches.map((batch) => batch.commit()));
  }
}
