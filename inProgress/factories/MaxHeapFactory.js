// not pure
export default function MaxHeapFactory(ObjArray, field ) {

    const Parent = i => Math.floor((i-1)/2);
    const Left = i => 2*i+1;
    const Right = i => 2*i+2;
    
    

    for( let i = Math.floor(ObjArray.length/2) - 1; i >= 0; i-- )
	maxHeapify( ObjArray, field, i );


    // for A = ObjArray.map( o => o[field] ),
    // assumes that A[Left(i)] and A[Right(i)] are roots of max-heaps,
    // but the tree with root A[i] might not be;
    // returns a new array such that A[i] is the root of a max-heap

    function maxHeapify(ObjArray, field, i) {

	const A = ObjArray.map( o => o[field] );

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

	    const temp = ObjArray[i];
	    ObjArray[i] = ObjArray[largest];
	    ObjArray[largest] = temp;
	    
	    ObjArray = maxHeapify( ObjArray, field, largest );
	}

	return ObjArray;
    }
  
    function insert( newObj ) {

	ObjArray.push( newObj );

	let index = ObjArray.length - 1;
	let temp;

	while( index > 0 && ObjArray[Parent(index)][field] < ObjArray[index][field] ) {

	    temp = ObjArray[index];
	    ObjArray[index] = ObjArray[Parent(index)];
	    ObjArray[Parent(index)] = temp;

	    index = Parent(index);			    
	}

    }

    function removeMax() {

	if( ObjArray.length === 0 ) {

	    console.log('removeMax called on an empty heap; returned null');

	    return null;
	}

	const A = ObjArray.map( o => o[field] );

	const max = A[0];
	ObjArray[0] = ObjArray.pop();

	maxHeapify( ObjArray, field, 0 );

	return max;
    }
	    
	

    const getArray = () => ObjArray;
    
    const getLength = () => ObjArray.length;

    const getMax = () => ObjArray[field][0];

    
    
    return {getArray, getLength, getMax, removeMax, insert};    
	
}

// tests

/*
const objArray = [{radius: 3, id: 'a'},
                  {radius: 4, id: 'b'},
                  {radius: 2, id: 'c'},
                  {radius: 12, id: 'd'},
                  {radius: 8, id: 'e'}]

const h = MaxHeapFactory( objArray, 'radius' );

console.log( h.getArray() );

// [12, 8, 2, 4, 3]

console.log(h.removeMax());

console.log( h.getArray() );

h.insert( {radius: 100, id: 'new'} );

console.log( h.getArray() );

*/

// pure
 function MaxHeapFactoryOld( B, ObjArray, field ) {

    const Parent = i => Math.floor((i-1)/2);
    const Left = i => 2*i+1;
    const Right = i => 2*i+2;
    
    let A = B.slice(0);

    for( let i = Math.floor(A.length/2) - 1; i >= 0; i-- )
	maxHeapify( ObjArray, field, i );

    function maxHeapifyNew(ObjArray, field, i) {

	const A = ObjArray.map( o => o[field] );

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

	    const temp = ObjArray[i];
	    ObjArray[i] = ObjArray[largest];
	    ObjArray[largest] = temp;
	    
	    ObjArray = maxHeapifyNew( ObjArray, field, largest );
	}

	return ObjArray;
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
