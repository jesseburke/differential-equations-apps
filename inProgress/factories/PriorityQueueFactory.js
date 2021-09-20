//  pure
export default function PriorityQueueFactory( origObjArray, field ) {

    let objArray = origObjArray.slice();
    
    const Parent = i => Math.floor((i-1)/2);
    const Left = i => 2*i+1;
    const Right = i => 2*i+2;
    
    

    for( let i = Math.floor(objArray.length/2) - 1; i >= 0; i-- )
	maxHeapify( objArray, field, i );


    // for A = objArray.map( o => o[field] ),
    // assumes that A[Left(i)] and A[Right(i)] are roots of max-heaps,
    // but the tree with root A[i] might not be;
    // returns a new array such that A[i] is the root of a max-heap
    //
    // not pure
    function maxHeapify(objArray, field, i) {

	const A = objArray.map( o => o[field] );

	const l = Left(i);
	const r = Right(i);

	let largest;

	if( l < A.length && A[l] > A[i] )
	    largest = l;

	else
	    largest = i;

	if( r < A.length && A[r] > A[largest] )
	    largest = r;

	if( largest !== i ) {

	    const temp = objArray[i];
	    objArray[i] = objArray[largest];
	    objArray[largest] = temp;
	    
	    objArray = maxHeapify( objArray, field, largest );
	}

	return objArray;
    }

    // not pure
    function insert( newObj ) {

	objArray.push( newObj );

	let index = objArray.length - 1;
	let temp;

	while( index > 0 && objArray[Parent(index)][field] < objArray[index][field] ) {

	    temp = objArray[index];
	    objArray[index] = objArray[Parent(index)];
	    objArray[Parent(index)] = temp;

	    index = Parent(index);			    
	}

    }

    // not pure
    function pop() {

	if( objArray.length === 0 ) {

	    console.log('tried to pop an empty priority queue; returned null');

	    return null;
	}

	if( objArray.length === 1 ) {

	    const temp = objArray[0];

	    objArray = [];

	    return temp;
	}
	    

	const A = objArray.map( o => o[field] );

	const max = objArray[0];
	objArray[0] = objArray.pop();

	maxHeapify( objArray, field, 0 );

	return max;
    }
	    
    const push = insert;

    const getArray = () => objArray;
    
    const getLength = () => objArray.length ? objArray.length : null;

    const peek = () => objArray[0] ? objArray[0][field] : null;

    const isEmpty = () => ( objArray.length === 0 );
    
    
    return { getLength, peek, pop, push, insert, getArray, isEmpty};    
	
}

// tests

/*
  const objArray = [{radius: 3, id: 'a'},
  {radius: 4, id: 'b'},
  {radius: 2, id: 'c'},
  {radius: 12, id: 'd'},
  {radius: 8, id: 'e'}]

  const p = PriorityQueueFactory( objArray, 'radius' );

  console.log( p.peek() );

  // 12

  console.log( p.pop());

  // 12

  console.log( p.peek() );

  // 8
  
  p.insert( {radius: 100, id: 'new'} );

  console.log( p.peek() );

  // 100

*/

// pure
 function MaxHeapFactoryOld( B, objArray, field ) {

    const Parent = i => Math.floor((i-1)/2);
    const Left = i => 2*i+1;
    const Right = i => 2*i+2;
    
    let A = B.slice(0);

    for( let i = Math.floor(A.length/2) - 1; i >= 0; i-- )
	maxHeapify( objArray, field, i );

    function maxHeapifyNew(objArray, field, i) {

	const A = objArray.map( o => o[field] );

	const l = Left(i);
	const r = Right(i);

	let largest;

	if( l < A.length && A[l] > A[i] )
	    largest = l;

	else
	    largest = i;

	if( r < A.length && A[r] > A[largest] )
	    largest = r;

	if( largest !== i ) {

	    const temp = objArray[i];
	    objArray[i] = objArray[largest];
	    objArray[largest] = temp;
	    
	    objArray = maxHeapifyNew( objArray, field, largest );
	}

	return objArray;
    }

      // assumes that A[Left(i)] and A[Right(i)] are roots of max-heaps,
      // but the tree with root A[i] might not be;
      // returns a new arrray with A[i] percolated down to the correct place

      function maxHeapify(A, i) {


	  const l = Left(i);
	  const r = Right(i);

	  let largest;

	  if( l < A.length && A[l] > A[i] )
	      largest = l;

	  else
	      largest = i;

	  if( r < A.length && A[r] > A[largest] )
	      largest = r;

	  if( largest !== i ) {

	      const temp = A[i];
	      A[i] = A[largest];
	      A[largest] = temp;
	      
	      A = maxHeapify( A, largest );
	  }

	  return A;
      }

    function insert( newVal ) {

	A[A.length] = -Infinity;

	increaseValue( A.length-1, newVal );		
    }

    // changes A[index] to newValue, then heapifies the resulting array    
    function increaseValue( index, newVal ) {

	if( newVal < A[index] ) {

	    console.log('increaseValue called on a heap with new value less than existing value');

	    return;
	}

	A[index] = newVal;

	let temp;

	while( index > 0 && A[Parent(index)] < A[index] ) {

	    temp = A[index];
	    A[index] = A[Parent(index)];
	    A[Parent(index)] = temp;

	    index = Parent(index);			    
	}

    }

    function removeMax() {

	if( A.length === 0 ) {

	    console.log('removeMax called on an empty heap; returned null');

	    return null;
	}

	const max = A[0];
	A[0] = A.pop();

	maxHeapify( A, 0 );

	return max;
    }
	    
	

    const getArray = () => A;
    
    const getLength = () => A.length;

    const getMax = () => A[0];

    
    
    return {getArray, getLength, getMax, removeMax, insert};    
	
}

// tests:

/*
const h = MaxHeapFactory( [4, 1, 3, 2, 16, 9, 10, 14, 8, 7] );

console.log( h.getArray() );

// expect [16, 14, 10, 8, 7, 9, 3, 2, 4, 1]

console.log( h.removeMax() );

// expect 16

console.log( h.getArray() );

// expect [14, 10, 8, 7, 9, 3, 2, 4, 1]

console.log( h.increaseValue(8, 15) );

console.log( h.getArray() );

// expect [15, 14, 10, 8, 7, 9, 3, 2, 4]

h.insert(12);

console.log( h.getArray() );

// expect [15, 14, 10, 8, 12, 9, 3, 2, 4, 7]

h.insert(15);

console.log( h.getArray() );

// expect [15, 15, 10, 8, 14, 9, 3, 2, 4, 7, 12]


*/
