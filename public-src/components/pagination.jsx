import React from 'react';
import { Pagination } from 'react-bootstrap';
import { browserHistory } from 'react-router';

const PaginationHelper = React.createClass({
  // this.props.base        => what is the base route for these pages?
  // this.props.page        => What page are we on?
  // this.props.total       => The total number of items we are paginating
  // this.props.perPage     => How many items are shown per page?

  handleSelect: function(page){
    browserHistory.push(this.props.base + '/' + (page - 1));
    window.location.reload(); // TODO: FIX THIS TERRIBLE HACK
  },

  render: function(){
    const page           = parseInt(this.props.page || 0);
    const lastItemOnPage = this.props.perPage * (page + 1);
    const lastPage       = Math.ceil(this.props.total / this.props.perPage) - 1;

    if(this.props.total === 0){ return null; }
    if(lastPage === 0){ return null; }

    return(
      <Pagination
        prev={page === 0 ? false : true}
        first={page === 0 ? false : true}
        next={lastPage > page ? true : false }
        last={lastPage > page ? true : false }
        ellipsis
        items={(lastPage + 1)}
        maxButtons={5}
        activePage={(page + 1)}
        onSelect={this.handleSelect}
      />
    );
  }
});

export default PaginationHelper;
