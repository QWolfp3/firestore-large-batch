# firestore-large-batch

A library for batching operations in Firestore. This library allows you to perform more than 500 operations in a single batch, and commit them all at once.

## Installing

```
npm install firestore-large-batch
```

## Usage

```typescript
import * as admin from "firebase-admin";
import { LargeBatch } from "firestore-large-batch";

// Initialize Firestore
const firestore = admin.firestore();
// Initialize LargeBatch
const largeBatch = new LargeBatch(firestore);

// Add operations to batch
largeBatch.create(firestore.doc("/users/user1"), { name: "John" });
largeBatch.set(firestore.doc("/users/user2"), { age: 25 });
largeBatch.update(firestore.doc("/users/user3"), {
  email: "johndoe@example.com",
});
largeBatch.updateField(firestore.doc("/users/user4"), "address", "New York");
largeBatch.delete(firestore.doc("/users/user5"));

//Commit all batches
largeBatch.commit();
```

You can also pass an optional commit unit to the commit method which will commit that many number of batches at a time.

```typescript
largeBatch.commit({ commitUnit: 10 });
```

This will divide the total number of batches into chunks of 10 and commit them one by one.

This is especially useful when you are performing a very large number of operations and want to avoid exceeding the limits of 10k writes/second.

**Note**

The class automatically creates new batches after reaching the maximum write limit of 500 operations per batch, so that you can continue to add operations without worrying about exceeding the limit.
