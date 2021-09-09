# Variable generator

Simple qvs to create a number of variables for testing APIs and client.

```
// Snippet to produce 1000 variables (all quite long, all with an integer at the start to make them unique)

For i=0 to 1000

	LET [v_$(i)] = 'Var' & $(i) & ': This is a wonderfully long variable which doesnt fit into the bla bLorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industrys standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.';
    
Next i;
```
