// "use client";

// import { useState, useEffect } from "react";
// import Header from "@/app/components/header";
// import { useRouter } from "next/navigation";
// import Link from "next/link";

// export default function Page() {

//   const router = useRouter();

//   const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL;

//   const [lead, setLead] = useState(null);
//   const [activities, setActivities] = useState([]);

//   // master data states
//   const [companies, setCompanies] = useState([]);
//   const [sources, setSources] = useState([]);
//   const [categories, setCategories] = useState([]);
//   const [productCategories, setProductCategories] = useState([]);
//   const [products, setProducts] = useState([]);

//   // load lead
//   useEffect(() => {

//     const leadId = sessionStorage.getItem("viewLeadId");

//     if (!leadId) {
//       router.push("/sales/lead");
//       return;
//     }

//     fetchLead(leadId);

//   }, []);


//   const fetchLead = async (id) => {

//     try {

//       const token = localStorage.getItem("token");

//       const res = await fetch(
//         `${API_BASE}/api/lead/sales/leads/view-leads/${id}`,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`
//           }
//         }
//       );

//       const data = await res.json();

//       if (data.success) {

//         setLead(data.lead);
//         setActivities(data.activities || []);

//       }

//     }
//     catch (error) {

//       console.log(error);

//     }

//   };


//   // load master data

//   useEffect(() => {

//     fetch(`${API_BASE}/api/organizations/organization-name`)
//       .then(res => res.json())
//       .then(data => setCompanies(data.data || data))

//   }, [])


//   useEffect(() => {

//     fetch(`${API_BASE}/api/inquiry-lead-source/read?status=1`)
//       .then(res => res.json())
//       .then(data => setSources(data))

//   }, [])


//   useEffect(() => {

//     fetch(`${API_BASE}/api/inquiry-lead-category/read?status=1`)
//       .then(res => res.json())
//       .then(data => setCategories(data))

//   }, [])


//   useEffect(() => {

//     fetch(`${API_BASE}/api/product-category/read?status=1`)
//       .then(res => res.json())
//       .then(data => setProductCategories(data))

//   }, [])


//   useEffect(() => {

//     fetch(`${API_BASE}/api/product-master/read`)
//       .then(res => res.json())
//       .then(data => setProducts(data))

//   }, [])



//   // helper functions to convert id -> name

//   const getCompanyName = (id) =>
//     companies.find(c => c.id == id)?.organization_name || id

//   const getSourceName = (id) =>
//     sources.find(s => s.id == id)?.name || id

//   const getCategoryName = (id) =>
//     categories.find(c => c.id == id)?.name || id

//   const getProductCategoryName = (id) =>
//     productCategories.find(p => p.id == id)?.name || id

//   const getProductName = (id) =>
//     products.find(p => p.id == id)?.product_name || id



//   if (!lead) {
//     return <p className="p-10">Loading...</p>;
//   }



//   return (

//     <>
//       <Header />

//       <div className="bg-gray-100">

//         <div className="bg-white w-full rounded-2xl shadow-lg p-3 mt-1 mb-5 flex justify-between items-center">

//           <p className="text-gray-700">

//             <Link href="/dashboard" className="mx-3 text-xl text-gray-400 hover:text-indigo-600">

//               <i className="bi bi-house"></i>

//             </Link>

//             <i className="bi bi-chevron-right"></i> Sales

//             <i className="bi bi-chevron-right"></i>

//             <button
//               onClick={() => { router.push("/sales/lead"); }}
//               className="mx-3 hover:text-indigo-600"
//             >
//               Lead
//             </button>

//             <i className="bi bi-chevron-right"></i> View Lead

//           </p>

//         </div>



//         <form className="p-1 mx-50">

//           <div className="bg-white rounded-xl border p-4 mt-2 w-6xl">


//             <div className="flex gap-8 border-b pb-2 mb-4 text-gray-700">

//               <p className="font-medium pb-1 text-xl">

//                 Contract

//               </p>

//             </div>



//             <div className="grid grid-cols-1 md:grid-cols-3 gap-y-6 gap-x-10 mx-10 mb-8">



//               <div>

//                 <p className="text-sm text-gray-600">Company Name</p>

//                 <p className="text-lg font-semibold">

//                   {getCompanyName(lead.company_name)}

//                 </p>



//                 <p className="text-sm text-gray-600 mt-6">Status</p>

//                 <p className="text-lg font-semibold">{lead.status}</p>



//                 <p className="text-sm text-gray-600 mt-6">Category</p>

//                 <p className="text-lg font-semibold">

//                   {getCategoryName(lead.category)}

//                 </p>



//                 <p className="text-sm text-gray-600 mt-6">Lead Title</p>

//                 <p className="text-lg font-semibold">{lead.lead_title}</p>

//               </div>



//               <div>

//                 <p className="text-sm text-gray-600">Customer</p>

//                 <p className="text-lg font-semibold">{lead.customer_name}</p>



//                 <p className="text-sm text-gray-600 mt-6">Product Category</p>

//                 <p className="text-lg font-semibold">

//                   {getProductCategoryName(lead.product_category)}

//                 </p>



//                 <p className="text-sm text-gray-600 mt-6">Assignee</p>

//                 <p className="text-lg font-semibold">{lead.assignee}</p>



//                 <p className="text-sm text-gray-600 mt-6">Description</p>

//                 <p className="text-lg font-semibold">{lead.description}</p>

//               </div>



//               <div>

//                 <p className="text-sm text-gray-600">Source</p>

//                 <p className="text-lg font-semibold">

//                   {getSourceName(lead.source)}

//                 </p>



//                 <p className="text-sm text-gray-600 mt-6">Product Name</p>

//                 <p className="text-lg font-semibold">

//                   {getProductName(lead.product_name)}

//                 </p>



//                 <p className="text-sm text-gray-600 mt-6">Created</p>

//                 <p className="text-lg font-semibold">

//                   {lead.created_at
//                     ? new Date(lead.created_at).toLocaleDateString()
//                     : "-"}

//                 </p>

//               </div>



//             </div>



//             <div className="flex justify-end mt-5">

//               <button
//                 type="button"
//                 onClick={() => router.push("/sales/lead")}
//                 className="px-5 py-2 bg-gray-100 rounded-sm text-gray-700 border hover:bg-gray-200"
//               >

//                 Cancel

//               </button>

//             </div>



//           </div>

//         </form>

//       </div>

//     </>

//   );

// }