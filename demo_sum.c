/*
Simple program used in demo for
- debugger
- system setup
*/

#include <stdio.h>
#include <stdlib.h>

#define H_SIZE 5

void print_array(int A[], int N);
int compute_sum(int *A, int N);

int main()
{
    int *arr = NULL;
    int total = 0, N = 0, j;

    printf("\nYou will be asked for N, the size of an array. \n");
    printf("The array will be populated with N values: 1 , 2, 3, 4, ..., N \n");
    printf("The sum of all the numbers in the array will be computed.\n");
    printf("It is used as a refresher for the formula: 1 + 2 + 3 + ...+ (N-1) + N = (N*(N+1))/2\n\n");

    printf("This program has a 2 bugs in it.\n");
    printf("If you give size 5 or smaller the Valgrind report will give one error.\n");
    printf("If you give size %d or larger the 2nd bug will generate additional errors in the Valgrind report.\n", H_SIZE+1);
    printf("Run it with 5 one time and with %d another time. Run it first without Valgrind and then with Valgrind.\n", H_SIZE+1);

    printf("Enter N: ");
    scanf("%d", &N);

    if (N < 0)
        N = H_SIZE;

    arr = calloc(H_SIZE, sizeof(int));

    // copy hardcoded data so we do not have to enter from the user.
    for(j = 0; j < N ; j++){
        arr[j] = j+1;
        print_array(arr, N);
    }

    printf("\nThe array is: ");
    print_array(arr, N);
    printf("\n");

    total = compute_sum(arr, N);
    printf("\nThe sum is: %d\n", total );

    print_array(arr, N);    

    printf("Bye\n");

    return 0;
}

int compute_sum(int *A, int N)
{
    int k = 0, mySum = 0, val;

    printf("%6s -> %6s    %6s\n", "value", "sum", "(val*(val+1))/2");
    printf("-----------------------------------\n");
    k = 0;
    mySum = 0;
    while( k < N  )
    {
        val = A[k]  ;
        mySum = mySum + val; // mySum += val
        printf("%6d -> %6d    %6d\n", val, mySum, (val*(val+1))/2 );
        k++;
    }

    return mySum;
}


void print_array(int A[], int N)
{
    for (int k = 0; k < N ; k++ )
    {
        printf("%4d,", A[k]);
    }
    printf("\n");
}
