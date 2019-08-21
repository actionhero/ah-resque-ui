import React from 'react'
import { Pagination } from 'react-bootstrap'

function PaginationHelper ({ base, page = 0, total, perPage, history }) {
  // base        => what is the base route for these pages?
  // page        => What page are we on?
  // total       => The total number of items we are paginating
  // perPage     => How many items are shown per page?

  function handleSelect (page) {
    history.replace(`${base}/${page}`)
  }

  const lastPage = Math.ceil(total / perPage) - 1

  if (total === 0) { return null }
  if (lastPage === 0) { return null }

  return (
    <Pagination>
      {page !== 0 ? <Pagination.First onClick={() => handleSelect(0)} /> : null}
      {page !== 0 ? <Pagination.Prev onClick={() => handleSelect(page - 1)} /> : null}
      {page - 2 >= 0 ? <Pagination.Item onClick={() => handleSelect(page - 2)}>{page + 1 - 2}</Pagination.Item> : null}
      {page - 1 >= 0 ? <Pagination.Item onClick={() => handleSelect(page - 1)}>{page + 1 - 1}</Pagination.Item> : null}
      <Pagination.Item active>{page + 1}</Pagination.Item>
      {page + 1 <= lastPage ? <Pagination.Item onClick={() => handleSelect(page + 1)}>{page + 1 + 1}</Pagination.Item> : null}
      {page + 2 <= lastPage ? <Pagination.Item onClick={() => handleSelect(page + 2)}>{page + 1 + 2}</Pagination.Item> : null}
      {lastPage > page ? <Pagination.Next onClick={() => handleSelect(page + 1)} /> : null}
      {lastPage > page ? <Pagination.Last onClick={() => handleSelect(lastPage)} /> : null}
    </Pagination>
  )
}

export default PaginationHelper
