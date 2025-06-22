import InvitationCodes from '@/components/InvitationCodes';
import { getCurrentUser } from '@/lib/auth';
import { getInvitationCodesByCompanyId } from '@/lib/db';
import { redirect } from 'next/navigation';
import React from 'react'

const InvitationCodesPage = async () => {
  const user = await getCurrentUser();

  if (!user || user.role !== "ADMIN" || !user.companyId) {
    redirect("/login");
  }

  const codes = await getInvitationCodesByCompanyId(user.companyId);

  return (
    <InvitationCodes initialCodes={codes} />
  )
}

export default InvitationCodesPage