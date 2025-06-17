
'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  query,
  onSnapshot,
  type QueryConstraint,
  type DocumentData,
  type CollectionReference,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

interface UseFirestoreCollectionOptions<T> {
  collectionName: string;
  constraints?: QueryConstraint[];
  transform: (docId: string, data: DocumentData) => T;
}

interface UseFirestoreCollectionResult<T> {
  data: T[];
  isLoading: boolean;
  error: Error | null;
}

export function useFirestoreCollection<T extends { id: string }>({
  collectionName,
  constraints = [],
  transform,
}: UseFirestoreCollectionOptions<T>): UseFirestoreCollectionResult<T> {
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    const collectionRef = collection(db, collectionName) as CollectionReference<DocumentData>;
    const q = query(collectionRef, ...constraints);

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      try {
        const fetchedData: T[] = querySnapshot.docs.map((doc) => {
          return transform(doc.id, doc.data());
        });
        setData(fetchedData);
      } catch (transformError) {
        console.error(`Error transforming data for ${collectionName}:`, transformError);
        toast({
          title: `Error Processing Data`,
          description: `Could not process ${collectionName} data.`,
          variant: "destructive",
        });
        // Optionally set error state here if transform errors should be displayed
        // setError(transformError instanceof Error ? transformError : new Error('Data transformation failed'));
      } finally {
        setIsLoading(false);
      }
    }, (err) => {
      console.error(`Error fetching ${collectionName} with onSnapshot: `, err);
      toast({
        title: `Error Fetching ${collectionName}`,
        description: `Could not load ${collectionName} data from the database in real-time.`,
        variant: "destructive",
      });
      setError(err);
      setIsLoading(false);
    });

    return () => unsubscribe();
  // Caller MUST memoize 'constraints' and 'transform' (e.g., with useMemo/useCallback)
  // for stable dependencies and to prevent unnecessary re-fetches.
  }, [collectionName, toast, transform, ...constraints]);

  return { data, isLoading, error };
}
