SortBorn | Algorithm Visualizer
SortBorn is a high-fidelity, interactive web application designed to bridge the gap between theoretical algorithmic complexity and practical execution. Built with a minimalist "Bento Grid" aesthetic, it allows users to visualize, compare, and analyze sorting algorithms in real-time.
![alt text](https://via.placeholder.com/800x400?text=SortBorn+Dashboard+Preview)
(Replace with an actual screenshot of your app)
🌟 Key Features
1. Synchronized Comparison (Multi-Instance)
Side-by-Side Visualization: Compare two different algorithms (e.g., Quick Sort vs. Selection Sort) on the same dataset simultaneously to witness the efficiency gap between 
O
(
n
log
⁡
n
)
O(nlogn)
 and 
O
(
n
2
)
O(n 
2
 )
.
Algorithm Library: Supports Bubble Sort, Quick Sort, Merge Sort, Insertion Sort, and Selection Sort.
2. Precision Controls
Dynamic Scaling: Adjust array size from 10 to 200 elements.
Time Control: Variable speed slider (1ms to 500ms) with Play, Pause, and Reset functionality.
Sorting Direction: Toggle between Ascending and Descending orders instantly.
3. Advanced Analysis & Debugging
Real-time Metrics: Live tracking of Total Comparisons, Array Accesses, and Execution Time.
Contextual Metadata: At slow speeds, a "Debugger Mode" activates, showing floating metadata (Value, Index, State) above active bars.
Custom Dataset: Manually input your own comma-separated values to test specific edge cases (already sorted, reverse sorted, etc.).
4. Modern UI/UX
Bento-Grid Layout: A clean, structured interface using glassmorphism effects.
Custom Themes: Fully customizable color legends for idle, comparison, swap, and sorted states.
Responsive Design: Seamless performance across different screen resolutions.
🛠️ Tech Stack
Frontend: React.js / Next.js
Styling: Tailwind CSS (for modern UI & Glassmorphism)
Icons: Lucide-React
State Management: React Hooks (UseState, UseRef, UseEffect)
Deployment: Vercel / GitHub Pages
📊 Algorithm Overview
Algorithm	Best Case	Average Case	Worst Case	Space Complexity	Stable
Quick Sort	
O
(
n
log
⁡
n
)
O(nlogn)
O
(
n
log
⁡
n
)
O(nlogn)
O
(
n
2
)
O(n 
2
 )
O
(
log
⁡
n
)
O(logn)
No
Merge Sort	
O
(
n
log
⁡
n
)
O(nlogn)
O
(
n
log
⁡
n
)
O(nlogn)
O
(
n
log
⁡
n
)
O(nlogn)
O
(
n
)
O(n)
Yes
Insertion Sort	
O
(
n
)
O(n)
O
(
n
2
)
O(n 
2
 )
O
(
n
2
)
O(n 
2
 )
O
(
1
)
O(1)
Yes
Selection Sort	
O
(
n
2
)
O(n 
2
 )
O
(
n
2
)
O(n 
2
 )
O
(
n
2
)
O(n 
2
 )
O
(
1
)
O(1)
No
Bubble Sort	
O
(
n
)
O(n)
O
(
n
2
)
O(n 
2
 )
O
(
n
2
)
O(n 
2
 )
O
(
1
)
O(1)
Yes
🚀 Getting Started
Prerequisites
Node.js (v16.0 or higher)
npm or yarn
Installation
Clone the repository:
code
Bash
git clone https://github.com/Srujan-chad/SortBorn.git
cd SortBorn
Install dependencies:
code
Bash
npm install
Run the development server:
code
Bash
npm start
# or
npm run dev
Open the browser:
Navigate to http://localhost:3000 to see the application in action.
📸 Interface Guide
Sidebar: Control the dataset size, animation speed, and algorithm selection.
Top Bar: Switch between Single/Dual view and toggle sorting directions.
Main Canvas: Interactive bars that change color based on the current operation (Comparison = Blue, Swap = Red, Sorted = Green).
Metadata: Hover or slow down the speed to see specific element details.
🤝 Contributing
Contributions are welcome! If you have ideas for new sorting algorithms or UI enhancements:
Fork the Project.
Create your Feature Branch (git checkout -b feature/NewAlgo).
Commit your Changes (git commit -m 'Add some NewAlgo').
Push to the Branch (git push origin feature/NewAlgo).
Open a Pull Request.
📝 License
Distributed under the MIT License. See LICENSE for more information.
Project Link: https://github.com/Srujan-chad/SortBorn
