An explanation after the Trainee challenge deadline, It was my first doing anything like this so I'm actually glad to have participated.

The code is basically a program which gathers info from an endpoint, then we organize that data using our database.

We basically each step, record the step into the database, check if the information belongs to someone already in the files and if not then proceed to create an entry.

Then we verify a few things from the subject based on the info give(such as, should this person be on the Active Restraining Order(ARO) file, should we sign this person as
a potential aggressor due to gang related activities and so on).

Then we actually create the entry within the database a verify if that person has any relation to someone with in the ARO file, if yes we mark that either as the offender or the protected one
and create an entry to represent this relation on the DB on another table.

We then proceed to check the last 5 or in the current version of the code, the last 20 entries for any subjects that within 20 meters from each in order to crate an alert.

If we find that is the case, then we register the encounter for future reference and send the alert, restarting the process in a new line.

You'll see that we're basically putting most of this logic within a async function, this is for simplicity. You can also see that I've organized most functions in different files.

For example:

you'll find the required equation to calculate the distance between two subjects in the equation file, functions to handle server queries in the server command file, even the
main method which enables all those checks is located on the endpoint gathering file alluding to its function.

This creates a more organized code base, which is much better to work with.

We use the Haverside equation to calculate the point between both subjects based on their coordinates, which we gather from the endpoint and register on the database.

Based on that equation we confirm that an encounter is happening and then we define the type of encounter based on the subjects entry.

Two gang members? Gang meeting

An aggressor breaking an ARO? Violation of RO.

Anything else? generic encounter.

The concept is quite simple, it sure is something interesting to implement. you'll see that the first method within the endpoint gathering is the parseSemicolumn, we use that to
Organize the .txt input we've received into variables by breaking each section into columns using the semi columns as a reference.

I had a bit of trouble when using it since we have a case where there will be an additional element, which would be the aggressorID(id from the ARO registered aggressor) which is within
quotation mark and doesn't have the semicolumn, that caused a bit of trouble to figure out.

We basically check that but before we proceed, we check the last semi column then the first quotation mark after that and the last one - the content within that quotation mark is the
aggressor id - then we consider everything outside of that to be from the next line.

we kind go character by character to check these, through that we can divide each segment into a variable that we can use later in the code.

We also have some loops at the end of the endpoint gathering logic worth discussing, we basically run through the last steps taken in the DB and check if there was an encounter.
If there was we register, if not we proceed.

We register the encounter in a variable to check later, so we don't register again an encounter and proceed to find new encounters.

There are some functions specific to work with the ARO list, the encounter registry and one we use to output the results which you'll find on the general_tools file.

Ironically the index is the least used file here, it's our main method for sure starting the routing for our app but we don't run anything directly there that is worth
to mention.


