import { useState } from "react";
import "./App.css";
import LoadingModal from "./componenets/LoadingModal";
import Clock from "./componenets/Clock";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


export default function () {
	const [links, setLinks] = useState("");
	const [search, setSearch] = useState("");
	// const [searchResult, setSearchResult] = useState([]);
	const [text, setText] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const onSubmit = async () => {
		if (links.length === 0 ) {
			toast.warning('Please provide some links before submitting.');
			return;
		}
		setIsLoading(true);  
		try {
			const res = await fetch("http://localhost:8000/", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ links }),
			});
			if (!res.ok) {
				throw new Error('Network response was not ok');
			}
			const data = await res.json();
			if(data.message === "success"){
				toast.success(data.message);
			}else
			{
				toast.error(data.message)
			}
		} catch (error) {
			console.error("Failed to fetch data:", error);
			toast.warning('Failed to load data. Please try again later.',);
		} finally {
			setIsLoading(false);
		}
	};

	const onSearch = async () => {
		if (search.length === 0 ) {
			toast.warning('Please provide some links before submitting.');
			return;
		}
		setIsLoading(true);
		try {
			console.log(search);
			const res = await fetch("http://localhost:8000/search", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ search }),
			});
			if (!res.ok) {
				throw new Error('Network response was not ok');
			}
			const data = await res.json();
			console.log("data", data[1]);
			const plainText = [];
			data[1]?.result?.forEach(item => {
				plainText.push(item.id);
				// console.log(JSON.stringify(item));
				// plainText.push(JSON.stringify(item));
				// console.log(plainText);
			});
			setText(plainText);
			if(data.message === "success"){
				toast.success(data.message);
			}else
			{
				toast.error(data.message)
			}
		} catch (error) {
			console.error("Failed to fetch data:", error);
			toast.warning('Failed to load data. Please try again later.',);
		} finally {
			setIsLoading(false); 
		}
	};

	return (
		<>
			<nav>
				<div>YouTube</div>
			</nav>
			<section>
				<div className="left">
				<ToastContainer />
					<textarea
						className="yb-textarea mb-16"
						rows={10}
						value={links}
						onChange={(e) => setLinks(e.target.value)}
						placeholder="Enter YouTube video URL"></textarea>
					<button className="yb-button ml-auto" onClick={onSubmit}>
						Get Transcripts
					</button>
					{isLoading && <LoadingModal />}
				</div>
				<div className="right">
					<input type="text" value={search} onChange={(e) => setSearch(e.target.value)} className="yb-input mb-16" placeholder="please input keyword..."/>
					<textarea className="yb-search-result" rows={7} value={text} disabled>
					</textarea>
					<Clock />
					<button className="yb-button ml-auto" onClick={onSearch}>Search</button>
				</div>
			</section>
		</>
	);
}
