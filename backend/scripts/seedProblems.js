const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const mongoose = require("mongoose");
const Problem = require("../src/models/Problem");

const PROBLEMS = [
  {
    title: "Two Sum",
    slug: "two-sum",
    difficulty: "Easy",
    description: `Given an array of integers \`nums\` and an integer \`target\`, print the indices of the two numbers such that they add up to \`target\`.

### Input Format
First line contains space-separated integers for \`nums\`.
Second line contains the \`target\` integer.

### Output Format
Print the zero-based indices separated by space.

### Example 1
**Input:**
\`\`\`
2 7 11 15
9
\`\`\`
**Output:**
\`\`\`
0 1
\`\`\``,
    starterCode: {
      python: `# Write your Python solution below
import sys

def two_sum():
    lines = sys.stdin.read().splitlines()
    if not lines:
        return
    nums = list(map(int, lines[0].split()))
    target = int(lines[1])
    
    # TODO: Write your algorithm here

two_sum()
`,
      javascript: `// Write your JavaScript solution below
const fs = require('fs');

function twoSum() {
  const input = fs.readFileSync(0, 'utf-8').trim().split('\\n');
  if (!input || input.length < 2) return;
  const nums = input[0].split(' ').map(Number);
  const target = Number(input[1]);

  // TODO: Write your algorithm here
}

twoSum();
`,
      cpp: `// Write your C++ solution below
#include <iostream>
#include <vector>
#include <sstream>
using namespace std;

int main() {
    string line;
    if (!getline(cin, line)) return 0;
    stringstream ss(line);
    vector<int> nums;
    int num;
    while (ss >> num) nums.push_back(num);
    
    int target;
    if (!(cin >> target)) return 0;
    
    // TODO: Write your algorithm here
    
    return 0;
}
`,
      java: `// Write your Java solution below
import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextLine()) return;
        String[] parts = sc.nextLine().trim().split("\\\\s+");
        int[] nums = new int[parts.length];
        for (int i = 0; i < parts.length; i++) nums[i] = Integer.parseInt(parts[i]);
        int target = sc.nextInt();
        
        // TODO: Write your algorithm here
    }
}
`
    },
    testCases: [
      { input: "2 7 11 15\n9", expectedOutput: "0 1", isHidden: false },
      { input: "3 2 4\n6", expectedOutput: "1 2", isHidden: false },
      { input: "3 3\n6", expectedOutput: "0 1", isHidden: true },
    ],
  },
  {
    title: "Reverse String",
    slug: "reverse-string",
    difficulty: "Easy",
    description: `Given a string, print the reversed string.

### Input Format
A single string on standard input.

### Output Format
The reversed string.

### Example
**Input:** \`hello\`  
**Output:** \`olleh\``,
    starterCode: {
      python: `# Write your Python solution below
import sys

def reverse_string():
    s = sys.stdin.read().strip()
    # TODO: Write your algorithm here

reverse_string()
`,
      javascript: `// Write your JavaScript solution below
const fs = require('fs');

function reverseString() {
  const s = fs.readFileSync(0, 'utf-8').trim();
  // TODO: Write your algorithm here
}

reverseString();
`,
      cpp: `// Write your C++ solution below
#include <iostream>
#include <string>
using namespace std;

int main() {
    string s;
    if (cin >> s) {
        // TODO: Write your algorithm here
    }
    return 0;
}
`,
      java: `// Write your Java solution below
import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNext()) {
            String s = sc.next();
            // TODO: Write your algorithm here
        }
    }
}
`
    },
    testCases: [
      { input: "hello", expectedOutput: "olleh", isHidden: false },
      { input: "CodeForge", expectedOutput: "egroFedoC", isHidden: false },
      { input: "racecar", expectedOutput: "racecar", isHidden: true },
    ],
  },
  {
    title: "Valid Parentheses",
    slug: "valid-parentheses",
    difficulty: "Medium",
    description: `Given a string \`s\` containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.

Print \`true\` if valid, or \`false\` if invalid.`,
    starterCode: {
      python: `# Write your Python solution below
import sys

def isValid(s):
    # TODO: Write your algorithm here
    return False

s = sys.stdin.read().strip()
print("true" if isValid(s) else "false")
`,
      javascript: `// Write your JavaScript solution below
const fs = require('fs');

function isValid(str) {
  // TODO: Write your algorithm here
  return false;
}

const s = fs.readFileSync(0, 'utf-8').trim();
console.log(isValid(s) ? "true" : "false");
`,
      cpp: `// Write your C++ solution below
#include <iostream>
#include <string>
using namespace std;

bool isValid(string s) {
    // TODO: Write your algorithm here
    return false;
}

int main() {
    string s;
    if (cin >> s) {
        cout << (isValid(s) ? "true" : "false") << endl;
    }
    return 0;
}
`,
      java: `// Write your Java solution below
import java.util.*;

public class Main {
    public static boolean isValid(String s) {
        // TODO: Write your algorithm here
        return false;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNext()) {
            System.out.println(isValid(sc.next()) ? "true" : "false");
        }
    }
}
`
    },
    testCases: [
      { input: "()", expectedOutput: "true", isHidden: false },
      { input: "()[]{}", expectedOutput: "true", isHidden: false },
      { input: "(]", expectedOutput: "false", isHidden: false },
      { input: "([)]", expectedOutput: "false", isHidden: true },
    ],
  }
];

async function seed() {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/codeforge";
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB for seeding...");

    for (const prob of PROBLEMS) {
      await Problem.findOneAndUpdate({ slug: prob.slug }, prob, { upsert: true, returnDocument: "after" });
      console.log(`Seeded problem: ${prob.title}`);
    }

    console.log("All DSA problems seeded successfully.");
    process.exit(0);
  } catch (err) {
    console.error("Seeding error:", err);
    process.exit(1);
  }
}

seed();
