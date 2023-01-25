# firestore-large-batch

A library for batching operations in Firestore. This library allows you to perform more than 500 operations in a single batch, and commit them all at once.

## Installing

```
npm install firestore-large-batch
```

## Usage

```
import * as admin from 'firebase-admin'
import { LargeBatch } from "firestore-large-batch";

// Initialize Firestore
const firestore = admin.firestore();
// Initialize LargeBatch
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

This is especially useful when you are performing a very large number of operations and want to avoid exceeding the rate limits of the Firestore API.

**Note**

- The class is designed to automatically create new batches after 500 operations have been added to a batch, so you don't need to worry about creating new batches manually.
