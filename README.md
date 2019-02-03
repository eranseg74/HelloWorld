# HelloWorld
A simple Hello World RESTful API that uses cluster in order to use all the CPU's of the computer.

If the process is the **master** process, the program generates clusters using the ```fork()``` function but the program still runs each request once on one of the CPU's and not on all of the created processes.

On each request, a process id will be logged in order to show that the program is running on numerous resources.
