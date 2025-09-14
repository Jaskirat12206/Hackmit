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

int main(int argc, char** argv)
{
    int *arr = NULL;
    int total = 0, N = 0, j;

    if (argc < 2 )
    {
        printf("Not enough arguments. Needs one command-line argument (e.g. 5).\n");
        return 0;
    }
    else
    {
        N = atoi(argv[1]);
        printf("\nN is %d\n", N);
    }

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
