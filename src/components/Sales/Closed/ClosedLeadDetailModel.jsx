import React, { useRef, useEffect } from "react";
import { FaTimes, FaCalendarAlt, FaFileExcel, FaFilePdf, FaMapMarkerAlt, FaRupeeSign } from "react-icons/fa";
import { IoIosSchool, IoMdBusiness } from "react-icons/io";
import { MdPayment, MdPeople, MdEmail, MdPhone } from "react-icons/md";

const ClosedLeadDetailModal = ({ lead, onClose }) => {
  const modalRef = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const formatDate = (date) => {
    if (!date) return 'Not specified';
    try {
      const jsDate = date.toDate ? date.toDate() : new Date(date);
      return jsDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Invalid date';
    }
  };

  const formatCurrency = (amount) => {
    return amount ? `₹${amount.toLocaleString('en-IN')}` : 'Not specified';
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-[100] p-4 animate-fadeIn">
      <div
        ref={modalRef}
        className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl border border-gray-100 animate-slideUp transform transition-all duration-300"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 flex justify-between items-center sticky top-0 z-10">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-white/10 backdrop-blur-sm">
              <IoIosSchool className="text-white text-lg" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                Closed Lead Details
              </h2>
              <div className="flex items-center space-x-2 mt-0.5">
                <span className="text-blue-100/90 text-xs bg-white/10 px-2 py-0.5 rounded-full">
                  {lead?.projectCode || 'No project code'}
                </span>
                <span className="text-blue-100/70 text-xs flex items-center">
                  <FaMapMarkerAlt className="mr-1" />
                  {lead?.city || 'Location not specified'}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/90 hover:text-white transition-all p-1.5 rounded-full hover:bg-white/20 flex items-center justify-center"
            aria-label="Close modal"
          >
            <FaTimes size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto h-[calc(90vh-60px)] p-3 space-y-3">
          {/* 1. Institution Section */}
          <ModernSection
            title="Institution Details"
            icon={<IoMdBusiness className="text-blue-500" />}
            badge={`${lead?.collegeCode || 'No Code'}`}
            className="bg-gradient-to-br from-blue-50 to-blue-50/70"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <DetailCard label="College Name" value={lead?.collegeName} iconColor="text-blue-400" />
              <DetailCard label="College Code" value={lead?.collegeCode} iconColor="text-blue-400" />
              <DetailCard label="GST Number" value={lead?.gstNumber} iconColor="text-blue-400" />
              <DetailCard label="Address" value={lead?.address} fullWidth iconColor="text-blue-400" />
              <DetailCard label="City" value={lead?.city} iconColor="text-blue-400" />
              <DetailCard label="State" value={lead?.state} iconColor="text-blue-400" />
              <DetailCard label="Pincode" value={lead?.pincode} iconColor="text-blue-400" />
            </div>
          </ModernSection>

          {/* 2. Contacts Section */}
          <ModernSection
            title="Contact Information"
            icon={<MdPeople className="text-purple-500" />}
            className="bg-gradient-to-br from-purple-50 to-purple-50/70"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <ContactCard
                type="TPO"
                name={lead?.tpoName}
                email={lead?.tpoEmail}
                phone={lead?.tpoPhone}
                color="bg-purple-100"
                iconColor="text-purple-500"
              />
              <ContactCard
                type="Training Coordinator"
                name={lead?.trainingName}
                email={lead?.trainingEmail}
                phone={lead?.trainingPhone}
                color="bg-blue-100"
                iconColor="text-blue-500"
              />
              <ContactCard
                type="Account Contact"
                name={lead?.accountName}
                email={lead?.accountEmail}
                phone={lead?.accountPhone}
                color="bg-amber-100"
                iconColor="text-amber-500"
              />
            </div>
          </ModernSection>

          {/* 3. Program Details */}
          <ModernSection
            title="Program Details"
            icon={<IoIosSchool className="text-green-500" />}
            badge={`${lead?.studentCount || '0'} Students`}
            className="bg-gradient-to-br from-green-50 to-green-50/70"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <DetailCard label="Course" value={lead?.course} iconColor="text-green-400" />
              <DetailCard label="Year" value={lead?.year} iconColor="text-green-400" />
              <DetailCard label="Delivery Type" value={lead?.deliveryType} iconColor="text-green-400" />
              <DetailCard label="Passing Year" value={lead?.passingYear} iconColor="text-green-400" />

              {/* Course Specializations Table */}
              {lead?.courses?.length > 0 && (
                <div className="col-span-full mt-3">
                  <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <IoIosSchool className="text-green-500" />
                    Course Specializations
                  </h4>
                  <div className="border rounded-xl overflow-hidden border-gray-200">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left px-3 py-2 font-medium text-gray-600">Specialization</th>
                          <th className="text-left px-3 py-2 font-medium text-gray-600">Students</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {lead.courses.map((course, index) => (
                          <tr key={index} className="hover:bg-gray-50 transition-colors">
                            <td className="px-3 py-2">{course.specialization || 'N/A'}</td>
                            <td className="px-3 py-2 font-medium">{course.students || 'N/A'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              <DetailCard label="Total Students" value={lead?.studentCount} iconColor="text-green-400" />
              <DetailCard label="Total Hours" value={lead?.totalHours} iconColor="text-green-400" />
              <DetailCard
                label="Student Data"
                value={lead?.studentFileUrl ? "Uploaded" : "Not uploaded"}
                icon={lead?.studentFileUrl ?
                  <FaFileExcel className="text-green-500" /> :
                  <FaFileExcel className="text-gray-400" />}
                status={lead?.studentFileUrl ? "success" : "neutral"}
              />
            </div>

            {lead?.topics?.length > 0 && (
              <div className="mt-3">
                <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <FaCalendarAlt className="text-amber-500" />
                  Topics Breakdown
                </h4>
                <div className="border rounded-xl overflow-hidden border-gray-200">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left px-3 py-2 font-medium text-gray-600">Topic</th>
                        <th className="text-left px-3 py-2 font-medium text-gray-600">Hours</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {lead.topics.map((topic, index) => (
                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                          <td className="px-3 py-2">{topic.topic || 'N/A'}</td>
                          <td className="px-3 py-2 font-medium">{topic.hours || 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </ModernSection>

          {/* 4. Financials */}
          <ModernSection
            title="Financial Information"
            icon={<FaRupeeSign className="text-amber-500" />}
            badge={formatCurrency(lead?.netPayableAmount || lead?.totalCost)}
            className="bg-gradient-to-br from-amber-50 to-amber-50/70"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <DetailCard
                label="Total Students"
                value={lead?.studentCount}
                iconColor="text-amber-400"
              />
              <DetailCard
                label="Cost per Student"
                value={formatCurrency(lead?.perStudentCost)}
                iconColor="text-amber-400"
              />
              <DetailCard
                label="Base Amount (excl. GST)"
                value={formatCurrency(lead?.totalCost)}
                iconColor="text-amber-400"
              />
              <DetailCard
                label="GST Amount (18%)"
                value={formatCurrency(lead?.gstAmount || 0)}
                iconColor="text-amber-400"
              />
              <DetailCard
                label="Net Payable Amount"
                value={formatCurrency(lead?.netPayableAmount || lead?.totalCost)}
                highlight
                iconColor="text-amber-400"
              />
              <DetailCard
                label="Payment Type"
                value={lead?.paymentType}
                iconColor="text-amber-400"
              />
              <DetailCard
                label="Payment Status"
                value={lead?.paymentReceived ? "Completed" : "Pending"}
                status={lead?.paymentReceived ? "success" : "warning"}
                iconColor="text-amber-400"
              />
            </div>
          </ModernSection>

          {/* 5. Contract */}
          <ModernSection
            title="Contract Details"
            icon={<FaFilePdf className="text-red-500" />}
            badge={lead?.mouFileUrl ? "MOU Uploaded" : "No MOU"}
            className="bg-gradient-to-br from-red-50 to-red-50/70"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <DetailCard
                label="MOU Status"
                value={lead?.mouFileUrl ? "Uploaded" : "Not uploaded"}
                icon={lead?.mouFileUrl ?
                  <FaFilePdf className="text-red-500" /> :
                  <FaFilePdf className="text-gray-400" />}
                status={lead?.mouFileUrl ? "success" : "neutral"}
              />
              <DetailCard
                label="Contract Start"
                value={formatDate(lead?.contractStartDate)}
                icon={<FaCalendarAlt className="text-gray-400" />}
              />
              <DetailCard
                label="Contract End"
                value={formatDate(lead?.contractEndDate)}
                icon={<FaCalendarAlt className="text-gray-400" />}
              />
            </div>
          </ModernSection>
        </div>
      </div>
    </div>
  );
};

// Modern Section Component with enhanced design
const ModernSection = ({ title, icon, children, className = "", badge }) => (
  <div className={`rounded-lg overflow-hidden border border-gray-200 shadow-sm ${className}`}>
    <div className="px-3 py-2 flex items-center justify-between border-b border-gray-200 bg-white/50 backdrop-blur-sm">
      <div className="flex items-center">
        <span className="text-lg mr-2 p-1.5 rounded-lg bg-white shadow-sm">{icon}</span>
        <h3 className="text-base font-semibold text-gray-800">{title}</h3>
      </div>
      {badge && (
        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-white shadow-sm border border-gray-200">
          {badge}
        </span>
      )}
    </div>
    <div className="p-3">
      {children}
    </div>
  </div>
);

// Enhanced Detail Card with better styling
const DetailCard = ({ label, value, icon, fullWidth = false, highlight = false, status = "neutral", iconColor = "text-gray-400" }) => {
  let statusClasses = "";
  if (status === "success") statusClasses = "text-green-700 bg-green-100/50 border-green-200";
  if (status === "warning") statusClasses = "text-amber-700 bg-amber-100/50 border-amber-200";
  if (status === "neutral") statusClasses = "text-gray-700 bg-gray-100/50 border-gray-200";

  return (
    <div className={`${fullWidth ? "col-span-full" : ""}`}>
      <div className="flex items-start space-x-3">
        {icon ? (
          <span className={`mt-1 ${iconColor}`}>{icon}</span>
        ) : (
          <div className={`w-2 h-2 rounded-full mt-2 ${iconColor} opacity-70`}></div>
        )}
        <div className="flex-1">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</p>
          <div className={`mt-1 text-sm font-medium ${highlight ? "text-blue-600 font-semibold" : "text-gray-800"} 
            ${status && status !== "neutral" ? `${statusClasses} px-3 py-1.5 rounded-lg border text-sm` : ""}`}>
            {value || 'Not specified'}
          </div>
        </div>
      </div>
    </div>
  );
};

// New Contact Card component for better contact display
const ContactCard = ({ type, name, email, phone, color, iconColor }) => (
  <div className={`rounded-lg border border-gray-200 p-3 ${color}/20 backdrop-blur-sm`}>
    <div className="flex items-center space-x-2 mb-2">
      <div className={`p-1.5 rounded-lg ${color} ${iconColor}`}>
        {type === 'TPO' && <MdPeople size={14} />}
        {type === 'Training Coordinator' && <IoIosSchool size={14} />}
        {type === 'Account Contact' && <MdPayment size={14} />}
      </div>
      <h4 className="font-medium text-gray-800 text-sm">{type}</h4>
    </div>
    <div className="space-y-1">
      <div className="flex items-center text-xs">
        <span className="text-gray-500 w-16">Name:</span>
        <span className="font-medium">{name || 'Not specified'}</span>
      </div>
      <div className="flex items-center text-xs">
        <span className="text-gray-500 w-16">Email:</span>
        <span className="font-medium">{email || 'Not specified'}</span>
      </div>
      <div className="flex items-center text-xs">
        <span className="text-gray-500 w-16">Phone:</span>
        <span className="font-medium">{phone || 'Not specified'}</span>
      </div>
    </div>
  </div>
);

export default ClosedLeadDetailModal;
