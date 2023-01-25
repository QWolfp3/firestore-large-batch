# firestore-large-batch

A library for batching operations in Firestore. This library allows you to perform multiple create, set, update, update field, and delete operations in a single batch, and commit them all at once.

## Installation

```
npm install firestore-large-batch
```

## Usage

```
import * as admin from 'firebase-admin'
import { LargeBatch } from "firestore-large-batch";

const firestore = admin.firestore();
const largeBatch = new LargeBatch(firestore);

// Add operations to batch
largeBatch.create(firestore.doc("/users/user1"), {name: "John"});
largeBatch.set(firestore.doc("/users/user2"), {age: 25});
largeBatch.update(firestore.doc("/users/user3"), {email: "johndoe@example.com"});
largeBatch.updateField(firestore.doc("/users/user4"), "address", "New York");
largeBatch.delete(firestore.doc("/users/user5"));

//Commit all batches
largeBatch.commit();
```

You can also pass an optional commit unit to the commit method which will commit that many number of batches at a time.

```
largeBatch.commit(10);
```

**Note**

- The class is designed to automatically create new batches after 500 operations have been added to a batch, so you don't need to worry about creating new batches manually.

## API

`create<T>(documentRef: firestore.DocumentReference<T>, data: T)`

Adds a create operation to the current batch.


`set<T>(documentRef: firestore.DocumentReference<T>, data: Partial<T> | firestore.WithFieldValue<T>, options?: firestore.SetOptions | undefined)`

Adds a set operation to the current batch.


`update<T>(documentRef: firestore.DocumentReference<T>, data: firestore.UpdateData<T>, precondition?: firestore.Precondition)`

Adds an update operation to the current batch.


`updateField(documentRef: firestore.DocumentReference<unknown>, field: string | firestore.FieldPath, value: unknown, ...fieldsOrPrecondition: unknown[])`

Adds an update field operation to the current batch.


`delete(documentRef: firestore.DocumentReference<unknown>, precondition?: firestore.Precondition)`

Adds a delete operation to the current batch.


`async commit(commitUnit?: number)`

Commits all batches. Optionally, you can pass a commit unit which controls the number of batches that are committed at a time.
