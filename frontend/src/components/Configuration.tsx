import { useState, useEffect } from 'react';
import axios from 'axios';
import '../App.scss';

interface BaseComponent {
    label: string;
}

interface SelectComponent extends BaseComponent {
    type: "select";
    options: string[];
}

interface TextComponent extends BaseComponent {
    type: "textfield";
    placeholder: string;
}

type FormComponent = SelectComponent | TextComponent;

export default function Configuration() {
    const [items, setItems] = useState<FormComponent[]>([]);

    useEffect(() => {
        axios.get('/api/v1/items/')
            .then((res) => {
                console.log(res.data);
                setItems(res.data);
            })
            .catch((err) => {
                console.log(err);
            })
    }, []);

    return (
        <div className="center w-screen h-screen">
            <button data-drawer-target="sidebar-multi-level-sidebar" data-drawer-toggle="sidebar-multi-level-sidebar" aria-controls="sidebar-multi-level-sidebar" type="button" className="inline-flex items-center p-2 mt-2 ms-3 text-sm text-gray-500 rounded-lg sm:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600">
                <span className="sr-only">Open sidebar</span>
                <svg className="w-6 h-6" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path clipRule="evenodd" fillRule="evenodd" d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"></path>
                </svg>
            </button>
            {/* {items.map((item) => {
                console.log(item);
                if (item.type === "select") {
                    return (
                        <div>
                            <label>{item.label}</label>
                            <select>
                                {item.options.map((option) => {
                                    return (
                                        <option>{option}</option>
                                    )
                                })}
                            </select>
                        </div>
                    )
                } else {
                    return (
                        <div>
                            <label>{item.label}</label>
                            <input type="text" placeholder={item.placeholder} />
                        </div>
                    )
                }
            }, [])} */}
        </div>
    )
}