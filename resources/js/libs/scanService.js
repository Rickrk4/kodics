import { useEffect, useState } from "react";

export default function useScanService() {
  const [scan, setScan] = useState();
  let interval;
  const setIntervalScan = id => {
    interval = setInterval(() => {
      fetch('/api/jobs/' + id)
        .then(res => res.json())
        .then(res => res.data)
        .then(setScan)
        .catch(() => setScan({...scan, progressPercentage: 100}) || clearInterval(interval))
    }, 1000);
  }

  const handleNewScan = () => {
    fetch('/api/jobs/create')
      .then(res => res.json())
      .then(res => res.data)
      .then(res => setScan(res) || setIntervalScan(res.id));
  }

  useEffect(() => {
    fetch('/api/jobs/')
      .then(res => res.json())
      .then(res => res.data.length > 0 && setIntervalScan(res.data[0].id))
    return () => {setScan(null) || clearInterval(interval)};
  }, []);

  return [scan, handleNewScan];
  
}