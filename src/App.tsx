import React, {useState, useEffect} from 'react';
import InputField from "./components/InputField";
import TodoList from "./components/TodoList";
import {Todo} from "./models/Todo"
import {Configuration, OpenAIApi} from "openai";
import {FaGithub} from "react-icons/fa";
import './App.css';


function App() {
  const [todo, setTodo] = useState<string>("")
  const [todos, setTodos] = useState<Todo[]>([])
  const configuration = new Configuration({
    apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  });
  const openai = new OpenAIApi(configuration);
  const [loading, setLoading] = useState(false);

  async function generateFunnyText(todo: string): Promise<string> {
    setLoading(true);
    try {
      const result = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: `Schreibe einen lustigen oder interessanten Satz auf Deutsch mit maximal 5 Wörtern ohne Zeilenumbrüche zu einer Aufgabe aus einer Todo Listen App.\n\nTodo: ${todo}\nTipp/ Witz: `,
        temperature: 0.48,
        max_tokens: 150,
      });
      //console.log("response", result.data.choices[0].text);
      setLoading(false);
      return (result.data.choices[0].text ?? "Text nicht lesbar").replace(/(\r\n|\n|\r)/gm, " ").trim()
    } catch (e) {
      console.log(e);
      setLoading(false);
      return "Fehler"
    }
  }
  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (todo) {
      todos.unshift({
        id: Date.now(),
        todo: todo.trim(),
        detailsText: await generateFunnyText(todo),
        isCompleted: false
      })
      setTodos(todos)
      localStorage.setItem('todos', JSON.stringify(todos));
      setTodo("")
    }
  }

  useEffect(() => {
    const todos: Todo[] = JSON.parse(localStorage.getItem('todos') || '{}');
    if (todos) {
      setTodos(todos);
    }
  }, []);
  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  return <div className="App">
    <a className="github_link" href="http://github.com/tkoehlerlg/taskify-react" target="_blank"><FaGithub/></a>
    <span className="heading">Taskify</span>
    <p>Die <b>Erinnerungs-App</b> – Erinnere dich an das Unvergessliche. Entwickelt mit <b>React</b> !</p>
    <InputField todo={todo} loading={loading} setTodo={setTodo} handleAdd={handleAdd}/>
    <TodoList todos={todos} setTodos={setTodos}/>
  </div>
}

export default App;
