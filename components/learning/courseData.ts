export type VisualType =
  | 'memory-model'
  | 'flow'
  | 'stack-frame'
  | 'class-hierarchy'
  | 'hash-map'
  | 'linked-list'
  | 'array-resize'
  | 'stream-pipeline'
  | 'exception-flow'
  | 'code-demo';

export interface Topic {
  id: string;
  title: string;
  duration: string;
  description: string;
  visualType: VisualType;
  codeSnippet: string;
  explanation: string;
}

export interface Module {
  id: string;
  title: string;
  topics: Topic[];
}

export interface Course {
  id: string;
  title: string;
  subtitle: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  totalHours: string;
  color: string;
  icon: string;
  modules: Module[];
}

export const courses: Course[] = [
  {
    id: 'java-developer',
    title: 'Java Developer Course',
    subtitle: 'Master Java from basics to advanced concepts',
    level: 'Beginner',
    totalHours: '40 hrs',
    color: 'from-orange-500 to-red-500',
    icon: '☕',
    modules: [
      {
        id: 'core-java',
        title: 'Module 1: Core Java Basics',
        topics: [
          {
            id: 'variables',
            title: 'Variables & Data Types',
            duration: '15 min',
            description: 'Learn how Java stores data in memory — primitives on the Stack, objects on the Heap.',
            visualType: 'memory-model',
            codeSnippet: `int age = 25;          // Stack
double salary = 50000; // Stack
String name = "John";  // Heap (String pool)
int[] scores = {90,85};// Heap (array object)`,
            explanation:
              'Java has 8 primitive types (int, double, boolean, char, byte, short, long, float). Primitives are stored directly on the Stack. Reference types (objects, arrays, Strings) live on the Heap, while the variable holding the reference lives on the Stack.',
          },
          {
            id: 'control-flow',
            title: 'Control Flow',
            duration: '12 min',
            description: 'if/else, switch, for, while, do-while — how the CPU follows branches.',
            visualType: 'flow',
            codeSnippet: `int score = 85;
if (score >= 90) {
  System.out.println("A");
} else if (score >= 80) {
  System.out.println("B");  // ← this runs
} else {
  System.out.println("C");
}`,
            explanation:
              'The JVM evaluates conditions top-down. When a condition is true the matching block executes and the rest are skipped. The flowchart on the left shows how the decision tree branches at each condition.',
          },
          {
            id: 'methods',
            title: 'Methods & Stack Frames',
            duration: '18 min',
            description: 'Every method call pushes a new stack frame. See how the call stack grows and shrinks.',
            visualType: 'stack-frame',
            codeSnippet: `public static int add(int a, int b) {
  return a + b;      // frame: {a=3, b=4}
}

public static void main(String[] args) {
  int result = add(3, 4); // pushes frame
  System.out.println(result); // 7
}                             // pops frame`,
            explanation:
              'When main() calls add(), the JVM pushes a new frame onto the call stack containing the local variables a and b. When the method returns, the frame is popped and the return value is passed back to the caller.',
          },
        ],
      },
      {
        id: 'oop',
        title: 'Module 2: OOP Concepts',
        topics: [
          {
            id: 'classes-objects',
            title: 'Classes & Objects',
            duration: '20 min',
            description: 'A class is a blueprint; an object is an instance living on the Heap.',
            visualType: 'memory-model',
            codeSnippet: `class Car {
  String brand;
  int speed;

  void accelerate() { speed += 10; }
}

Car myCar = new Car(); // object on Heap
myCar.brand = "Toyota";
myCar.accelerate();`,
            explanation:
              'The class definition is stored in the Method Area. new Car() allocates an object on the Heap and returns a reference. myCar is a reference variable on the Stack pointing to that Heap location.',
          },
          {
            id: 'inheritance',
            title: 'Inheritance',
            duration: '22 min',
            description: 'Child classes inherit fields and methods from parent classes, forming a hierarchy.',
            visualType: 'class-hierarchy',
            codeSnippet: `class Animal {
  void eat() { System.out.println("eating"); }
}

class Dog extends Animal {
  void bark() { System.out.println("woof!"); }
}

Dog d = new Dog();
d.eat();  // inherited ✓
d.bark(); // own method ✓`,
            explanation:
              'Dog extends Animal, so it inherits eat(). The hierarchy tree shows how the JVM walks up the chain to find a method. Java supports single inheritance; multiple inheritance is achieved via interfaces.',
          },
          {
            id: 'polymorphism',
            title: 'Polymorphism',
            duration: '20 min',
            description: 'One interface, many implementations. Runtime dispatch decides which method to call.',
            visualType: 'flow',
            codeSnippet: `class Shape {
  void draw() { System.out.println("Shape"); }
}
class Circle extends Shape {
  @Override
  void draw() { System.out.println("Circle"); }
}

Shape s = new Circle(); // upcasting
s.draw(); // prints "Circle" — runtime dispatch`,
            explanation:
              'The reference type is Shape but the actual object is Circle. At runtime, the JVM checks the vtable of the actual object and calls Circle.draw(). This is dynamic (runtime) polymorphism via method overriding.',
          },
          {
            id: 'encapsulation',
            title: 'Encapsulation & Abstraction',
            duration: '15 min',
            description: 'Hide internal state; expose only what is necessary through a clean interface.',
            visualType: 'code-demo',
            codeSnippet: `class BankAccount {
  private double balance; // hidden

  public void deposit(double amount) {
    if (amount > 0) balance += amount;
  }

  public double getBalance() {
    return balance; // controlled access
  }
}`,
            explanation:
              'balance is private — no direct access. deposit() and getBalance() are the only ways to interact. Abstraction hides the "how"; encapsulation hides the "data". Together they reduce coupling and prevent invalid state.',
          },
        ],
      },
      {
        id: 'collections',
        title: 'Module 3: Collections & Generics',
        topics: [
          {
            id: 'arraylist',
            title: 'ArrayList — Dynamic Array',
            duration: '18 min',
            description: 'ArrayList starts with capacity 10. When full it grows by 50% — watch the resize animation.',
            visualType: 'array-resize',
            codeSnippet: `List<String> list = new ArrayList<>();
list.add("A"); // [A, _, _, ...]
list.add("B"); // [A, B, _, ...]
// When full: new array created, elements copied`,
            explanation:
              'Internally ArrayList uses Object[]. When size == capacity, Arrays.copyOf() creates a new array with 1.5× capacity and copies all elements. This is an O(n) operation but happens infrequently, giving amortized O(1) adds.',
          },
          {
            id: 'hashmap',
            title: 'HashMap — Hash Buckets',
            duration: '25 min',
            description: 'Keys are hashed to bucket indices. Collisions form linked lists (or red-black trees for Java 8+).',
            visualType: 'hash-map',
            codeSnippet: `Map<String, Integer> map = new HashMap<>();
map.put("apple", 1);
// hash("apple") % 16 → bucket index
map.put("banana", 2);
map.get("apple"); // O(1) average`,
            explanation:
              'HashMap has 16 default buckets. put() computes hash(key) % capacity to find the bucket. If two keys land in the same bucket (collision), they form a linked list. When a bucket has ≥8 entries, Java 8 converts it to a TreeMap (red-black tree) for O(log n) lookup.',
          },
          {
            id: 'linkedlist',
            title: 'LinkedList — Node Pointers',
            duration: '15 min',
            description: 'Doubly-linked nodes — fast insert/delete, slow random access.',
            visualType: 'linked-list',
            codeSnippet: `LinkedList<Integer> ll = new LinkedList<>();
ll.add(1); // [1]
ll.add(2); // [1] ↔ [2]
ll.addFirst(0); // [0] ↔ [1] ↔ [2]
ll.remove(1);   // O(n) to find, O(1) to remove`,
            explanation:
              'Each node holds data + prev + next pointers. Insertion at head/tail is O(1). Searching by index is O(n) because nodes are not contiguous in memory. Use LinkedList when you need frequent insertions/deletions at both ends.',
          },
        ],
      },
      {
        id: 'exceptions',
        title: 'Module 4: Exception Handling',
        topics: [
          {
            id: 'try-catch',
            title: 'Try / Catch / Finally',
            duration: '20 min',
            description: 'How the JVM unwinds the call stack when an exception is thrown.',
            visualType: 'exception-flow',
            codeSnippet: `try {
  int[] arr = new int[3];
  arr[10] = 5; // throws ArrayIndexOutOfBoundsException
} catch (ArrayIndexOutOfBoundsException e) {
  System.out.println("Caught: " + e.getMessage());
} finally {
  System.out.println("Always runs");
}`,
            explanation:
              'When the exception is thrown, the JVM stops executing the try block and searches the call stack for a matching catch. If found, the catch block runs. finally always runs regardless — useful for closing resources. Uncaught exceptions terminate the thread.',
          },
        ],
      },
      {
        id: 'java8',
        title: 'Module 5: Java 8+ Features',
        topics: [
          {
            id: 'streams',
            title: 'Streams & Pipeline',
            duration: '25 min',
            description: 'Declarative data processing through a source → intermediate ops → terminal op pipeline.',
            visualType: 'stream-pipeline',
            codeSnippet: `List<Integer> nums = Arrays.asList(1,2,3,4,5,6);

int sum = nums.stream()
  .filter(n -> n % 2 == 0)   // [2, 4, 6]
  .map(n -> n * n)            // [4, 16, 36]
  .reduce(0, Integer::sum);   // 56`,
            explanation:
              'Streams are lazy — filter and map don\'t execute until the terminal operation (reduce) is called. The pipeline animation shows data flowing element by element through each stage. Streams can be parallelised with .parallelStream() to use multiple CPU cores.',
          },
          {
            id: 'lambdas',
            title: 'Lambdas & Functional Interfaces',
            duration: '20 min',
            description: 'Anonymous functions that implement a single-method interface.',
            visualType: 'code-demo',
            codeSnippet: `// Before Java 8
Runnable r = new Runnable() {
  public void run() { System.out.println("Hi"); }
};

// Java 8 Lambda
Runnable r2 = () -> System.out.println("Hi");

// Method reference
List<String> names = Arrays.asList("Bob","Alice");
names.sort(String::compareToIgnoreCase);`,
            explanation:
              'A lambda (params) -> body replaces anonymous inner classes for functional interfaces (interfaces with exactly one abstract method). The compiler infers the target type from context. Common functional interfaces: Runnable, Comparator, Predicate, Function, Consumer, Supplier.',
          },
        ],
      },
    ],
  },
  {
    id: 'python-developer',
    title: 'Python Developer Course',
    subtitle: 'From Python basics to real-world applications',
    level: 'Beginner',
    totalHours: '35 hrs',
    color: 'from-blue-500 to-cyan-500',
    icon: '🐍',
    modules: [
      {
        id: 'python-basics',
        title: 'Module 1: Python Basics',
        topics: [
          {
            id: 'py-variables',
            title: 'Variables & Dynamic Typing',
            duration: '12 min',
            description: 'Python uses dynamic typing — variables are labels pointing to objects.',
            visualType: 'memory-model',
            codeSnippet: `x = 42          # int object
x = "hello"     # now points to str object
y = x           # both point to same object
print(id(x) == id(y))  # True`,
            explanation:
              'In Python everything is an object. Variables are references (pointers) to objects. Assigning x = "hello" doesn\'t change the int object — it creates a new str object and points x at it. id() returns the object\'s memory address.',
          },
          {
            id: 'py-lists',
            title: 'Lists & Comprehensions',
            duration: '15 min',
            description: 'Python lists are dynamic arrays. List comprehensions offer concise syntax.',
            visualType: 'array-resize',
            codeSnippet: `nums = [1, 2, 3, 4, 5]
squares = [n**2 for n in nums if n % 2 == 0]
# [4, 16]

# append triggers resize when over-capacity
nums.append(6)`,
            explanation:
              'Python lists use over-allocation to avoid resizing on every append. The list comprehension [expr for item in iterable if condition] is equivalent to a filtered map but more readable and faster than a for loop.',
          },
        ],
      },
      {
        id: 'py-oop',
        title: 'Module 2: OOP in Python',
        topics: [
          {
            id: 'py-classes',
            title: 'Classes & __init__',
            duration: '18 min',
            description: 'Python classes, constructors, and the self reference.',
            visualType: 'class-hierarchy',
            codeSnippet: `class Animal:
  def __init__(self, name):
    self.name = name
  def speak(self):
    return f"{self.name} speaks"

class Dog(Animal):
  def speak(self):
    return f"{self.name} says woof!"

d = Dog("Rex")
print(d.speak())  # Rex says woof!`,
            explanation:
              '__init__ is the constructor. self is a reference to the current instance. Python supports multiple inheritance and uses MRO (Method Resolution Order / C3 linearisation) to resolve method lookup order.',
          },
        ],
      },
    ],
  },
  {
    id: 'react-developer',
    title: 'React Developer Course',
    subtitle: 'Build modern UIs with React & Hooks',
    level: 'Intermediate',
    totalHours: '30 hrs',
    color: 'from-cyan-400 to-blue-600',
    icon: '⚛️',
    modules: [
      {
        id: 'react-basics',
        title: 'Module 1: React Fundamentals',
        topics: [
          {
            id: 'jsx-components',
            title: 'JSX & Components',
            duration: '15 min',
            description: 'JSX is syntactic sugar over React.createElement(). Components are functions that return JSX.',
            visualType: 'flow',
            codeSnippet: `// JSX compiles to:
const el = <h1>Hello</h1>;
// React.createElement('h1', null, 'Hello')

function Greeting({ name }) {
  return <h1>Hello, {name}!</h1>;
}`,
            explanation:
              'Babel transforms JSX into React.createElement() calls. A functional component is a pure function: given props in, returns JSX describing UI out. React\'s reconciler (Fiber) diffs the virtual DOM and batches real DOM updates.',
          },
          {
            id: 'hooks-state',
            title: 'useState & useEffect',
            duration: '22 min',
            description: 'useState adds reactive state; useEffect syncs with external systems.',
            visualType: 'flow',
            codeSnippet: `function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    document.title = \`Count: \${count}\`;
    return () => { /* cleanup */ };
  }, [count]); // runs when count changes

  return <button onClick={() => setCount(c => c+1)}>
    {count}
  </button>;
}`,
            explanation:
              'useState returns [value, setter]. Calling the setter schedules a re-render. useEffect(fn, [deps]) runs fn after render when any dep changes. The returned function is cleanup — runs before the next effect or on unmount.',
          },
        ],
      },
    ],
  },
];

export function getProgress(courseId: string): string[] {
  try {
    const raw = localStorage.getItem(`learn_progress_${courseId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveProgress(courseId: string, completedTopicIds: string[]): void {
  localStorage.setItem(`learn_progress_${courseId}`, JSON.stringify(completedTopicIds));
}

export function getCourseCompletionPercent(course: Course, completedIds: string[]): number {
  const total = course.modules.reduce((sum, m) => sum + m.topics.length, 0);
  if (total === 0) return 0;
  const done = course.modules.reduce(
    (sum, m) => sum + m.topics.filter(t => completedIds.includes(t.id)).length,
    0
  );
  return Math.round((done / total) * 100);
}
